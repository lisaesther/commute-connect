import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Create your account"
      title="Join CommuteConnect Ireland"
      description="Create an account to search for shared journeys, offer available seats, and manage your commute securely."
      alternateText="Already have an account?"
      alternateLinkLabel="Log in"
      alternateLinkHref="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
