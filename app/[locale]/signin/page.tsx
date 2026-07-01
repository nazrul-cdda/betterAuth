import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import SignInForm from "./signin-form";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return <SignInForm t={t.signIn} />;
}
