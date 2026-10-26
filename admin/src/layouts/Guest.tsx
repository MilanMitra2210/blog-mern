import { Outlet } from "react-router-dom";

import { store } from "@/store/store";
import { redirect } from "react-router-dom";

export const guestLoader = () => {
  const { isAuthenticated } = store.getState().auth;

  // Enable to check how error element works
  // if (!isAuthenticated) {
  //   throw new Response(JSON.stringify({ message: "Unauthorized" }), {
  //     status: 401,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  if (isAuthenticated) {
    throw redirect("/");
  }

  return null;
};

function Guest() {
  return <Outlet />;
}

export default Guest;
