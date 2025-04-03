import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Tempo',
  description: 'Log in or sign up to Tempo',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full">{children}</div>
    </div>
  );
}
