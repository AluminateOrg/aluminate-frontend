'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const { login } = useAuth();
  const router = useRouter();

  // No 'e: React.FormEvent' needed here anymore
  const handleSubmit = async () => {
    // e.preventDefault(); // This is no longer needed

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password, selectedRole);
      toast.success(`Welcome! Logged in as ${selectedRole}`);
      // router.push('/dashboard');  
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-300">

      <div className="flex w-full max-w-5xl min-h-[700px] rounded-xl shadow-2xl overflow-hidden bg-white animate-in fade-in zoom-in-95 duration-700">

        {/* Left Panel - Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-6">

          <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
          <p className="text-gray-600 text-sm">
            Sign in to access your dashboard.
          </p>

          {/* Role Selection Tabs (TOP) */}
          <Tabs defaultValue="member" onValueChange={(value: string) => setSelectedRole(value as UserRole)} className="w-full pt-4">
            <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-gray-100 rounded-md">

              <TabsTrigger
                value="member"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 rounded-sm h-8"
              >
                Member
              </TabsTrigger>

              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 rounded-sm h-8"
              >
                Admin
              </TabsTrigger>

            </TabsList>
          </Tabs>

          {/* Form replaced with a div */}
          <div className="space-y-8 pt-4 pb-">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300 text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 pr-4 py-2 h-11 rounded-md bg-white border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 py-2 h-11 rounded-md bg-white border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 text-gray-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              // type="submit" removed
              onClick={handleSubmit} // onClick added
              className="w-full py-3 h-11 text-base font-semibold rounded-md bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 mt-6"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
          {/* closing /div tag */}

          {/* Don't have an account? */}
          <p className="text-center text-sm text-gray-600 pt-4">
            Contact your administrator to become a member.
          </p>

        </div>

        {/* Right Panel - Logo & Welcome Message */}
        <div className="hidden lg:flex w-1/2 p-12 flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-[#1A3A37] to-gray-900 text-white relative">

          <Image
            src="/logo2.png"
            alt="Aluminate Logo"
            width={250}
            height={250}
            className="object-contain"
            priority
          />

          <p className="text-lg text-gray-500 max-w-sm">
            Bridging the Past, Building the Future
          </p>

        </div>
      </div>
    </div>
  );
}