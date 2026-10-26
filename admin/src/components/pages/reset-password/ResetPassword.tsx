import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

import TextField from "@/components/ui/Form/TextField";
import { PrimaryButton } from "@/components/ui/Button";
import { FadeIn, ScaleIn } from "@/components/ui/Motion";
import { useResetPasswordMutation, useVerfiyInvitationMutation } from "@/services/api";

const validation = yup.object({
  token: yup.string().required(),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

type FormData = typeof validation.__outputType;

type Props = {
  token: string;
  type: "reset-password" | "invite";
};

export default function ResetPassword({ token, type }: Props) {
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();
  const [verifyPassword] = useVerfiyInvitationMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      confirmPassword: "",
      password: "",
      token: token,
    },
    resolver: yupResolver(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      const action = type === "invite" ? verifyPassword : resetPassword;
      await action(data).unwrap();
      navigate("/login", { replace: true });
      toast.success("Password reset successfully, Please login!");
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0].msg;
      toast.error(
        validationError ?? error?.data?.message ?? "Something went wrong!"
      );
    }
  };

  return (
    <FadeIn className="w-full max-w-lg mx-auto">
      <div className="card-container">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="text-center mb-10">
            <ScaleIn delay={0.2} duration={0.8}>
              <div className="flex flex-col items-center">
                <div className="mb-8 group relative">
                  <img 
                    src="/logo.svg" 
                    alt="QuillForge Logo" 
                    className="w-40 h-auto object-contain relative z-10 transition-all duration-700 group-hover:scale-105 group-hover:brightness-110" 
                  />
                  <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                <h1 className="h1 tracking-tight">Reset Password</h1>
                <p className="medium-paragraph mt-2 font-medium opacity-70">
                  Create a strong new password for your account.
                </p>
              </div>
            </ScaleIn>
          </div>

          <div className="space-y-5">
            <TextField
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              {...register("password")}
            />

            <TextField
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </div>

          <PrimaryButton
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Update Password"
            )}
          </PrimaryButton>
        </form>
      </div>
    </FadeIn>
  );
}
