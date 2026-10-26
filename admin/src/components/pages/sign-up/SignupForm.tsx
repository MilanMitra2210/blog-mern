import { yupResolver } from "@hookform/resolvers/yup";

import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

import TextField from "@/components/ui/Form/TextField";
import { PrimaryButton } from "@/components/ui/Button";
import { ScaleIn, StaggeredContainer, StaggeredItem } from "@/components/ui/Motion";
import { useRegisterMutation } from "@/services/api";

const validation = yup.object({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  name: yup.string().required("Name is required"),
});

type FormData = typeof validation.__outputType;

export default function SignupForm() {
  const [registerUser] = useRegisterMutation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data).unwrap();
      toast.success("User registered successfully!");
      navigate("/");
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0].msg;
      toast.error(
        validationError ?? error?.data?.message ?? "Something went wrong!"
      );
    }
  };

  return (
    <ScaleIn className="max-w-lg w-full mx-auto">
        <div className="card-container">
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
                <h1 className="h1 tracking-tight">Create Account</h1>
                <p className="medium-paragraph mt-2 font-medium opacity-70">
                  Join us and start managing your workspace
                </p>
              </div>
            </ScaleIn>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <StaggeredContainer className="space-y-4">
              <StaggeredItem>
                <TextField
                  label="Name"
                  type="text"
                  placeholder="John Doe"
                  error={errors.name}
                  {...register("name")}
                />
              </StaggeredItem>

              <StaggeredItem>
                <TextField
                  label="Email"
                  type="text"
                  placeholder="name@example.com"
                  error={errors.email}
                  {...register("email")}
                />
              </StaggeredItem>

              <StaggeredItem>
                <TextField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password}
                  {...register("password")}
                />
              </StaggeredItem>

              <StaggeredItem>
                <TextField
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  {...register("confirmPassword")}
                />
              </StaggeredItem>
            </StaggeredContainer>

            <PrimaryButton
              type="submit"
              disabled={!isValid || isSubmitting}
              className="mt-4 w-full"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign Up"
              )}
            </PrimaryButton>

              <div className="pt-6 text-center">
                <p className="text-dark-blue/60 text-sm font-medium">
                  Already have an account?{" "}
                  <NavLink to="/login" className="text-primary font-bold hover:text-primary-dark hover:underline underline-offset-4 decoration-2 transition-all">
                    Sign in
                  </NavLink>
                </p>
              </div>
            </form>
          </div>
      </ScaleIn>
  );
}
