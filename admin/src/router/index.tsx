import { createBrowserRouter } from "react-router-dom";

import NotFound from "@/pages/not-found";

import guestRouter from "./guest";
import privateRouter from "./private";

const router = createBrowserRouter([
  privateRouter,
  guestRouter,
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
