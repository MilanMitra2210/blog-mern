// @ts-ignore
import { IResolveParams, LoginSocialApple } from "reactjs-social-login";
import { toast } from "react-toastify";
import { useLoginByAppleMutation } from "@/services/api";

export default function AppleLogin() {
  const [loginByApple] = useLoginByAppleMutation();

  const handleAppleLogin = async (params: IResolveParams) => {
    try {
      const id_token = params.data?.authorization?.id_token || "";
      if (!id_token) {
        throw new Error("Id token not found.");
      }
      await loginByApple({
        id_token,
      }).unwrap();
    } catch (error: any) {
      toast.error(
        error?.message || error?.data?.message || "Something went wrong"
      );
    }
  };

  const handleAppleLoginError = async (
    params: { [key: string]: any } | string
  ) => {
    if (typeof params === "string") {
    } else if (
      !["popup_closed_by_user", "user_trigger_new_signin_flow"].includes(
        params.err.error
      )
    ) {
      toast.error(params.err.error);
    }
  };

  return (
    <LoginSocialApple
      client_id={import.meta.env.VITE_APPLE_BUNDLE_ID || ""}
      redirect_uri={window.location.href}
      onResolve={handleAppleLogin}
      onReject={handleAppleLoginError}
    >
      <button
        type="button"
        className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm bg-white flex items-center justify-center"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.057 10.78c.042 2.612 2.263 3.478 2.295 3.493-.019.066-.354 1.211-1.159 2.385-.694 1.015-1.413 2.025-2.545 2.046-1.112.019-1.472-.659-2.744-.659-1.272 0-1.671.64-2.723.679-1.112.038-1.921-1.09-2.618-2.098-1.427-2.062-2.515-5.834-1.046-8.384.73-1.265 2.032-2.066 3.444-2.085 1.074-.019 2.086.724 2.744.724.658 0 1.905-.902 3.197-.773 1.13.047 2.158.627 2.783 1.511-2.483 1.511-2.079 4.655.372 5.651zM14.935 3.109c.591-.715 1.053-1.688.852-2.659-.854.034-1.889.57-2.5 1.282-.549.633-1.028 1.631-.77 2.57.949.073 1.902-.562 2.418-1.193z"
          />
        </svg>
      </button>
    </LoginSocialApple>
  );
}
