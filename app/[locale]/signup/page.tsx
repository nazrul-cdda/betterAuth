"use client"

import { useState } from "react";
import { useFormik } from "formik";
import { authClient } from "../../lib/auth-client";
import { toFormikValidate } from "../../lib/zod-formkik";
import { signUpSchema, SignUpValues } from "../../lib/validations/auth";
import { PasswordField } from "@/app/components/PasswordField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const formik = useFormik<SignUpValues>({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validate: toFormikValidate(signUpSchema),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");

      await authClient.signUp.email(
        {
          name: values.name,
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: () => setSubmitted(true),
          onError: (ctx) => setServerError(ctx.error.message),
        }
      );

      setSubmitting(false);
    },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="text-center w-64">Your verification email has been sent.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-3 w-64">
        <div>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
          )}
        </div>
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
          )}
        </div>
        <div>
          <PasswordField
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.password}
            touched={formik.touched.password}
            showStrength
            minLength={8}
            maxLength={20}
            numeric
            uppercase
            lowercase
            special
          // showRequirements
          />
        </div>
        <div>
          <PasswordField
            name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.confirmPassword}
            touched={formik.touched.confirmPassword}
            placeholder="Confirm Password"
          />
        </div>
        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
        <Button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
