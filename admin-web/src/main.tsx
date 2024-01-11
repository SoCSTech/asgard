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
import { AuthProvider } from "./auth";

import "@/index.css";
import Sidebar from "@/components/navigation/sidebar";
import TopBar from "@/components/navigation/top-bar";

// Routes
import Home from "@/routes/Home.tsx";
import Booze from "@/routes/booze";
import Login from "@/routes/login";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    loader() {
      // Our root route always provides the user, if logged in
      return { user: AuthProvider.username };
    },
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
      {
        path: "/booze",
        loader: protectedLoader,
        Component: Booze,
      },
    ],
  },
  {
    path: "/logout",
    async action() {
      // We signout in a "resource route" that we can hit from a fetcher.Form
      await AuthProvider.signout();
      return redirect("/");
    },
  },
]);

function Layout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <Sidebar />
      <div className="md:col-span-3 lg:col-span-4 p-5">
        <TopBar />
        <Outlet />
        {/* <Link to="/">Public Page</Link>
        <Link to="/protected">Protected Page</Link> */}
        <AuthStatus />
      </div>
    </div>
  );
}

function AuthStatus() {
  // Get our logged in user, if they exist, from the root route loader data
  let { user } = useRouteLoaderData("root") as { user: string | null };
  let fetcher = useFetcher();

  if (!user) {
    return <p>You are not logged in.</p>;
  }

  let isLoggingOut = fetcher.formData != null;

  return (
    <div className="bg-mint p-3">
      <p>Welcome {user}!</p>
      <fetcher.Form method="post" action="/logout">
        <button type="submit" disabled={isLoggingOut}>
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </fetcher.Form>
    </div>
  );
}

async function loginAction({ request }: LoaderFunctionArgs) {
  let formData = await request.formData();
  let username = formData.get("username") as string | null;

  // Validate our form inputs and return validation errors via useActionData()
  if (!username) {
    return {
      error: "You must provide a username to log in",
    };
  }

  // Sign in and redirect to the proper destination if successful.
  try {
    await AuthProvider.signin(username);
  } catch (error) {
    // Unused as of now but this is how you would handle invalid
    // username/password combinations - just like validating the inputs
    // above
    return {
      error: "Invalid login attempt",
    };
  }

  let redirectTo = formData.get("redirectTo") as string | null;
  return redirect(redirectTo || "/");
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  </React.StrictMode>
);
