'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check session on page load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        setEmail(session.user.email || null);
        
        // If email is already confirmed, redirect to dashboard
        if (session.user.email_confirmed_at) {
          setIsVerified(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    };
    
    checkSession();
  }, [router, user]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error sending verification email",
          description: error.message,
        });
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: "Please try again later",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 text-lg font-bold text-blue-600"
      >
        Tempo
      </Link>
      
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isVerified ? 'Email Verified!' : 'Verify your email'}
          </CardTitle>
          <CardDescription className="text-center">
            {isVerified 
              ? 'Your email has been successfully verified'
              : 'Please check your inbox to verify your email address'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="mx-auto rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center">
            {isVerified 
              ? <CheckCircle className="h-10 w-10 text-green-600" />
              : <Mail className="h-10 w-10 text-blue-600" />
            }
          </div>
          
          {isVerified ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                You will be redirected to the dashboard
              </p>
              <Button 
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to dashboard
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4 w-full">
              <p className="text-sm text-gray-600">
                We&apos;ve sent a verification email to{' '}
                <span className="font-semibold">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to verify your account. If you don&apos;t see the email, check your spam folder.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend verification email'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-gray-600">
            <Link 
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
