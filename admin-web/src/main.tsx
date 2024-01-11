import React from "react";
import ReactDOM from "react-dom/client";
import Home from "@/routes/Home.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@/index.css";
import Sidebar from "@/components/navigation/sidebar";
import TopBar from "@/components/navigation/top-bar";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/josh",
    element: <div>is cool!</div>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Sidebar />
      <div className="md:col-span-3 p-5">
        <TopBar />
        <RouterProvider router={router} />
      </div>
    </div>
  </React.StrictMode>
);
