import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  // FIX: Access data.email and add the path config
  .refine((data) => {
    const localPart = data.email.split("@")[0];
    return !localPart.includes("+");
  }, {
    path: ["email"], // This ensures the error attaches to the email field in your UI
    message: "Email aliases are not allowed",
  });

export type SignUpValues = z.infer<typeof signUpSchema>;