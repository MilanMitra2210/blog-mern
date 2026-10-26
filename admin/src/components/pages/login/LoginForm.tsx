import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

import { FadeIn, ScaleIn } from "@/components/ui/Motion";
import TextField from "@/components/ui/Form/TextField";
import { PrimaryButton } from "@/components/ui/Button";
import { useLoginMutation } from "@/services/api";
import GoogleLogin from "./GoogleLogin";
import FBLogin from "./FBLogin";

const validation = yup.object({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
});

type FormData = typeof validation.__outputType;


export default function LoginForm() {
  const [loginUser] = useLoginMutation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await loginUser(data).unwrap();
      toast.success("User logged in successfully!");
      navigate("/", { replace: true });
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0].msg;
      console.log(error);
      
      toast.error(
        validationError ?? error?.data?.message ?? "Something went wrong!",
      );
    }
  };

  return (
    <FadeIn className="max-w-lg w-full mx-auto">
      <div className="card-container">
        <div className="text-center mb-10">
          <ScaleIn delay={0.2} duration={0.8}>
            <div className="flex flex-col items-center">
              <div className="mb-10 group relative">
                <img 
                  src="/logo.svg" 
                  alt="QuillForge Logo" 
                  className="w-48 h-auto object-contain relative z-10 transition-all duration-700 group-hover:scale-105 group-hover:brightness-110" 
                />
                <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <h1 className="h1 tracking-tight">Welcome Back</h1>
              <p className="medium-paragraph mt-3 font-medium opacity-70">
                Please enter your details to sign in
              </p>
            </div>
          </ScaleIn>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TextField
                label="Email Address"
                type="text"
                placeholder="name@example.com"
                error={errors.email}
                {...register("email")}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <TextField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password}
                  {...register("password")}
                />
                <NavLink
                  to="/forgot-password"
                  className="absolute right-1 top-0 extra-small-paragraph text-primary! font-bold hover:text-primary-dark transition-colors"
                >
                  Forgot password?
                </NavLink>
              </div>
            </motion.div>
          </div>

          <PrimaryButton type="submit" className="w-full" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign In</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </div>
            )}
          </PrimaryButton>

          {/* Social Logins as required by PDF spec */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Or continue with
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <GoogleLogin />
            <FBLogin />
          </div>

          <div className="pt-4 text-center">
            <p className="text-dark-blue/60 text-sm font-medium">
              New to our platform?{" "}
              <NavLink
                to="/signup"
                className="text-primary font-bold hover:text-primary-dark hover:underline underline-offset-4 decoration-2 transition-all"
              >
                Create account
              </NavLink>
            </p>
          </div>
        </form>
      </div>
    </FadeIn>
  );
}
