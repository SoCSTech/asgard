import React from "react";
import ReactDOM from "react-dom/client";

import type { LoaderFunctionArgs } from "react-router-dom";
import {
  Form,
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useActionData,
  useFetcher,
  useLocation,
  useNavigation,
  useRouteLoaderData,
} from "react-router-dom";

import { AuthProvider } from "@/auth";
import "@/index.css";

// Routes
import Home from "@/routes/home";
import Login from "@/routes/login";
import Layout from "./layout";

async function loginAction({ request }: LoaderFunctionArgs) {
  let formData = await request.formData();
  let username = formData.get("username") as string | null;
  let password = formData.get("password") as string | null;

  // Validate our form inputs and return validation errors via useActionData()
  if (!username || !password) {
    return {
      error: "You must provide both username and password to log in",
    };
  }

  try {
    await AuthProvider.signin(username, password);

    // Redirect to the proper destination if successful.
    let redirectTo = formData.get("redirectTo") as string | null;
    return redirect(redirectTo || "/");
  } catch (error: any) {
    return {
      error: error.message || "An error occurred during login",
    };
  }
}


async function loginLoader() {
  if (AuthProvider.isAuthenticated) {
    return redirect("/");
  }
  return null;
}

function protectedLoader({ request }: LoaderFunctionArgs) {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication
  if (!AuthProvider.isAuthenticated) {
    let params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/login?" + params.toString());
  }
  return null;
}

function App() {
  const router = createBrowserRouter([
    {
      id: "root",
      path: "/",
      loader() {
        // Our root route always provides the user, if logged in
        return { user: AuthProvider.username };
      },
      // Use DefaultLayout for authenticated routes
      Component: Layout,
      children: [
        {
          path: "login",
          action: loginAction,
          loader: loginLoader,
          Component: Login,
        },
        {
          index: true,
          Component: Home,
          loader: protectedLoader,
        },
      ],
    },
    {
      path: "/logout",
      async action() {
        console.log("hi im logging out")
        // We signout in a "resource route" that we can hit from a fetcher.Form
        await AuthProvider.signout();
        return redirect("/");
      },
    },
  ]);

  return (
    <React.StrictMode>
      {/* Use layout dynamically based on authentication status */}
      <RouterProvider
        router={router}
        fallbackElement={<p>Initial Load...</p>}
      />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
