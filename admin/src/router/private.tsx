import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

import AuthenticatedLayout, { authLoader } from "@/layouts/Authenticated";
import ErrorPage from "@/pages/error";
import LazyFallback from "@/components/ui/LazyFallback";
import { profileLoader } from "@/loaders/profileLoader";

const Home = lazy(() => import("@/pages/homepage"));
const Profile = lazy(() => import("@/pages/profile"));
const Media = lazy(() => import("@/pages/media"));
const UsersList = lazy(() => import("@/pages/users"));
const Blogs = lazy(() => import("@/pages/blogs"));
const BlogEdit = lazy(() => import("@/pages/blog-edit"));
const Comments = lazy(() => import("@/pages/comments"));
const Roles = lazy(() => import("@/pages/roles"));

const privateRouter: RouteObject = {
  element: <AuthenticatedLayout />,
  loader: authLoader,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Home />
        </Suspense>
      ),
    },
    {
      path: "/profile",
      loader: profileLoader,
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Profile />
        </Suspense>
      ),
    },
    {
      path: "/media",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Media />
        </Suspense>
      ),
    },
    {
      path: "/users",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <UsersList />
        </Suspense>
      ),
    },
    {
      path: "/blogs",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Blogs />
        </Suspense>
      ),
    },
    {
      path: "/blogs/new",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <BlogEdit />
        </Suspense>
      ),
    },
    {
      path: "/blogs/:id/edit",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <BlogEdit />
        </Suspense>
      ),
    },
    {
      path: "/comments",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Comments />
        </Suspense>
      ),
    },
    {
      path: "/roles",
      element: (
        <Suspense fallback={<LazyFallback />}>
          <Roles />
        </Suspense>
      ),
    },
  ],
};
export default privateRouter;
