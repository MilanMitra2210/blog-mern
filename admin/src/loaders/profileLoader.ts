import { api } from "@/services/api";
import { store } from "@/store/store";

export const profileLoader = async () => {
  const result = await store.dispatch(api.endpoints.me.initiate());

  if ("error" in result) {
    throw new Response("Profile not found", { status: 404 });
  }

  return result.data;
};
