import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/shared/SEO';
import { useAuth } from '@/contexts/AuthContext';

function getAuthErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String(error.code);
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Invalid email or password.';
    }
    if (code === 'auth/user-not-found') {
      return 'No Firebase Auth user exists for that email.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Try again in a few minutes.';
    }
  }

  return 'Unable to sign in right now.';
}

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      setIsLoading(false);
      navigate('/admin');
    } catch (submitError) {
      setIsLoading(false);
      setError(getAuthErrorMessage(submitError));
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <SEO title="Admin Login" description="Login to LeapAndSleep Admin" noIndex />

      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <BrandLogo className="justify-center" imageClassName="h-12" />
            <p className="text-2xl font-semibold text-[#0B0D10] mt-2">Admin Login</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-[28px] p-8 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6D727A]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@leapandsleep.com"
                    required
                    className="pl-10 bg-[#F6F7F9] border-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6D727A]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 bg-[#F6F7F9] border-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D727A]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full h-12"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#6D727A]">
                Use an account created in Firebase Authentication with Email/Password enabled.
              </p>
              <Link to="/" className="mt-3 inline-block text-sm text-[#6D727A] hover:text-[#0B0D10]">
                Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
