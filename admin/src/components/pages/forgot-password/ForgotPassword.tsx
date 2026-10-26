import { yupResolver } from "@hookform/resolvers/yup";

import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForgotPasswordMutation } from "../../../services/api";

import { PrimaryButton } from "../../ui/Button";
import { FadeIn, ScaleIn } from "../../ui/Motion";
import TextField from "../../ui/Form/TextField";

const validation = yup.object({
  email: yup.string().email("Email is invalid").required("Email is required"),
});

type FormData = typeof validation.__outputType;

export default function ForgotPassword() {
  const [forgotPassword] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await forgotPassword(data).unwrap();
      toast.success("Email sent successfully!");
      reset();
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0].msg;
      toast.error(
        validationError ?? error?.data?.message ?? "Something went wrong!"
      );
    }
  };

  return (
    <FadeIn className="max-w-lg w-full mx-auto">
        <div className="card-container">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <h1 className="h1 tracking-tight">Forgot Password?</h1>
                  <p className="medium-paragraph mt-2 font-medium opacity-70">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>
              </ScaleIn>
            </div>

            <TextField
              label="Email Address"
              type="text"
              placeholder="name@example.com"
              error={errors.email}
              {...register("email")}
            />

            <PrimaryButton
              type="submit"
              className="w-full"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </PrimaryButton>

            <div className="text-center">
              <NavLink
                to="/login"
                className="small-paragraph text-primary! font-bold hover:text-primary-dark transition-colors inline-flex items-center gap-2 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Back to Sign in
              </NavLink>
            </div>
          </form>
        </div>
      </FadeIn>
  );
}
