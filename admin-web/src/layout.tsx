import { AuthProvider } from "@/auth";

import { Outlet, useRouteLoaderData, useFetcher } from "react-router-dom";

import Sidebar from "@/components/navigation/sidebar";
import TopBar from "@/components/navigation/top-bar";

function AuthStatus() {
  // Get our logged in user, if they exist, from the root route loader data
  let { user } = useRouteLoaderData("root") as { user: string | null };

  if (!user) {
    return <span className="pr-6 text-l">You are not logged in.</span>;
  }

  // <fetcher.Form method="post" action="/logout">
  //   <button type="submit" disabled={isLoggingOut}>
  //     {isLoggingOut ? "Signing out..." : "Sign out"}
  //   </button>
  // </fetcher.Form>

  return <span className="pr-6 text-l">Hi {user}!</span>;
}

function Layout() {
    // let fetcher = useFetcher();
    
  return (
    <div className="">
      
      <TopBar authStatus={<AuthStatus />}/>
      <Outlet />
    </div>
  );
}

export default Layout;
