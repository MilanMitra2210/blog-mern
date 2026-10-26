import * as yup from "yup";

export const userSchema = yup.object({
  name: yup.string().nullable().optional(),
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().optional().when("$isEdit", {
    is: (val: boolean) => !val,
    then: (schema) => schema.required("Password is required").min(6, "Password must be at least 6 characters"),
  }),
  role: yup.string().required("Role is required"),
  roleId: yup.string().nullable().optional(),
  active: yup.boolean().default(true),
  imageId: yup.string().nullable().optional(),
  image: yup.mixed().nullable().optional(),
  blocked: yup.boolean().nullable().optional(),
  blockReason: yup.string().nullable().optional(),
  siteId: yup.string().nullable().optional(),
});

export type UserFormValues = yup.InferType<typeof userSchema>;
