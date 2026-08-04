import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to CommuteConnect"
      description="Access your dashboard to manage shared journeys, booking requests, and upcoming commutes."
      alternateText="New to CommuteConnect?"
      alternateLinkLabel="Create an account"
      alternateLinkHref="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}
