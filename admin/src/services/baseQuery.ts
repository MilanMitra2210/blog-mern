import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { resetTokens, setTokens } from "../store/reducers/authReducer";
import { RootState } from "../store/store";

export const baseUrl = import.meta.env.VITE_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const activeSiteId = localStorage.getItem("active_site_id");
    if (activeSiteId) {
      headers.set("x-site-id", activeSiteId);
    }

    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (
    result.error &&
    result.error.status === 401
  ) {
    const authState = (api.getState() as RootState).auth;

    if (!authState.accessToken || !authState.refreshToken) {
      return result; // Nothing to do if we don't have tokens
    }

    const refreshResult = await baseQuery(
      {
        url: "/users/refresh-token",
        method: "POST",
        body: { refresh_token: authState.refreshToken },
      },
      api,
      extraOptions
    );

    //@ts-ignore
    const response = refreshResult.data as ApiResponse<TokenResponse>;
    const data = response?.data;

    if (data) {
      // Update state with new tokens
      api.dispatch(setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      }));

      // Retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(resetTokens());
    }
  }

  return result;
};
