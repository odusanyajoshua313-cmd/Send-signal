import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-container">
      <div className="w-full max-w-md p-8 card-surface shadow-xl">
        <div className="flex items-center justify-center mb-8">
           <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
