import Layout from "@/layouts";
import Error404 from "@/pages/error404";
import Home from "@/pages/home";
import User from "@/pages/user";
import Entity from "@/pages/entity";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/entity/:entity",
        element: <Entity />,
      },
      {
        path: "/account",
        element: <User />,
      },
    ],
  },
]);

export default router;
