import { AuthProvider } from "@/auth";

import { Outlet, useRouteLoaderData, useFetcher } from "react-router-dom";

import Sidebar from "@/components/navigation/sidebar";
import TopBar from "@/components/navigation/top-bar";

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

function Layout() {
    return (
      <div className="">
          <TopBar />
          <Outlet />
          <AuthStatus />
      </div>
    );
}

export default Layout;