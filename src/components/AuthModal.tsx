import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.png';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  useEffect(() => {
    if (user) {
      onOpenChange(false);
    }
  }, [user, onOpenChange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      loginSchema.parse(loginData);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.info('Please verify your email first');
          navigate('/auth');
          onOpenChange(false);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Signed in successfully!');
        onOpenChange(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      registerSchema.parse(registerData);
      
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: registerData.username,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification code sent to your email!');
        navigate('/auth');
        onOpenChange(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card">
        <div className="p-6 pb-0">
          <DialogHeader className="items-center text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg ring-1 ring-border/50">
              <img src={logo} alt="NotePath" className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">Log in to your account</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Welcome back! Please enter your details.
              </p>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
                Sign up
              </TabsTrigger>
              <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
                Log in
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-login-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="modal-login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-11"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-login-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="modal-login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="modal-remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-primary data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="modal-remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                      Remember for 30 days
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/auth');
                      onOpenChange(false);
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password
                  </button>
                </div>
                
                <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 font-medium border-border hover:bg-muted/50" 
                  onClick={handleGoogleSignIn}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
              
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    navigate('/auth?tab=register');
                    onOpenChange(false);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0 space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-register-username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="modal-register-username"
                    type="text"
                    placeholder="johndoe"
                    className="h-11"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-register-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="modal-register-email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-11"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-register-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="modal-register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pr-10"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-register-confirm" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="modal-register-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pr-10"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 font-medium border-border hover:bg-muted/50" 
                  onClick={handleGoogleSignIn}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </form>
              
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    navigate('/auth');
                    onOpenChange(false);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
