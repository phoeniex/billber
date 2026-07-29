import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Mail, Lock, User, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const { login, signup, googleLogin, appleLogin } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.name, formData.email, formData.password);
            }
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-border/20 shadow-2xl">
                <div className="p-8 bg-card/95 backdrop-blur-md">
                    {/* Header */}
                    <DialogHeader className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-3 shadow-md">
                            <DollarSign className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </DialogTitle>
                        <p className="text-muted-foreground text-xs">
                            Sign in to manage and sync your bills
                        </p>
                    </DialogHeader>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 p-1 bg-muted rounded-lg mb-6">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={cn(
                                'flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all duration-300',
                                isLogin
                                    ? 'bg-primary text-primary-foreground shadow-md font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={cn(
                                'flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all duration-300',
                                !isLogin
                                    ? 'bg-primary text-primary-foreground shadow-md font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name field (signup only) */}
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <Label htmlFor="modal-name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="modal-name"
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="pl-10 h-11 bg-muted/50 focus:bg-card transition-all duration-300 text-sm"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="modal-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="modal-email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10 h-11 bg-muted/50 focus:bg-card transition-all duration-300 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="modal-password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="modal-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 h-11 bg-muted/50 focus:bg-card transition-all duration-300 text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password */}
                        {isLogin && (
                            <div className="text-right">
                                <button type="button" className="text-xs text-primary hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-sm font-bold rounded-2xl shadow-md hover:scale-[1.02] transition-all duration-300 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-5">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                            or continue with
                        </span>
                    </div>

                    {/* Social login buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    await googleLogin();
                                    onClose();
                                } catch (err: any) {
                                    setError(err instanceof Error ? err.message : 'Google login failed');
                                }
                            }}
                            className="h-11 text-xs font-semibold rounded-xl hover:scale-105 transition-transform"
                            type="button"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    await appleLogin();
                                    onClose();
                                } catch (err: any) {
                                    setError(err instanceof Error ? err.message : 'Apple login failed');
                                }
                            }}
                            className="h-11 text-xs font-semibold rounded-xl hover:scale-105 transition-transform"
                            type="button"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.68.79 3.15 1.48-.02.01-1.88 1.1-1.86 3.29.02 2.62 2.3 3.49 2.33 3.52-.02.06-.36 1.25-1.19 2.47-.73 1.05-1.5 2.08-2.62 2.06v.21zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.38-2.12 4.19-3.74 4.25z" />
                            </svg>
                            Apple
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
