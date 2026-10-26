import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

import GuestLayout, { guestLoader } from "@/layouts/Guest";
import ErrorPage from "@/pages/error";
import LazyFallback from "@/components/ui/LazyFallback";

const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));

const guestRouter: RouteObject = {
  element: <GuestLayout />,
  loader: guestLoader,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/login",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: "/signup",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Register />
        </Suspense>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <ForgotPassword />
        </Suspense>
      ),
    },
    {
      path: "/reset-password",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <ResetPassword />
        </Suspense>
      ),
    },
  ],
};
export default guestRouter;
