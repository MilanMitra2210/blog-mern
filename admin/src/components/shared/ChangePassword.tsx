import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { KeyRound, RefreshCw } from "lucide-react";

import { useAppDispatch } from "@/store/store";
import { api, ApiTag, useChangePasswordMutation } from "@/services/api";
import TextField from "@/components/ui/Form/TextField";
import { PrimaryButton } from "@/components/ui/Button";


const validation = yup.object({
  currentPassword: yup.string().when("$provider", {
    is: (provider: string) => provider === "MANUAL",
    then: (schema) => schema.required("Current password is required"),
    otherwise: (schema) => schema.optional(),
  }),
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
  user: User;
};

export default function ChangePassword({ user }: Props) {
  const dispatch = useAppDispatch();
  const { provider } = user;
  const [changePassword] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      confirmPassword: "",
      password: "",
      currentPassword: "",
    },
    context: { provider },
    resolver: yupResolver<FormData, unknown, unknown>(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await changePassword({
        oldPassword: data.currentPassword ?? "",
        newPassword: data.password ?? "",
      }).unwrap();
      dispatch(api.util.invalidateTags([ApiTag.ME]));
      reset();
      toast.success("Password changed successfully!");
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0].msg;
      toast.error(
        validationError ??
          error?.data?.detail ??
          error?.data?.message ??
          "Something went wrong!",
      );
    }
  };

  return (
    <div className="max-w-lg mt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <TextField
          label="Current Password"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword}
          {...register("currentPassword")}
        />

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

        <div className="pt-2">
          <PrimaryButton
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-max"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            {isSubmitting ? "Updating..." : "Update Password"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
