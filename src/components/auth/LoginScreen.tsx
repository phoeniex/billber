import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

export const LoginScreen = () => {
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
        } catch (err) {
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5 p-4 transition-colors duration-300 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <DollarSign className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 tracking-tight">
                        Billber
                    </h1>
                    <p className="text-base-content/60 text-sm">
                        Your smart bill management companion
                    </p>
                </div>

                {/* Login/Signup Card */}
                <div className="card bg-base-100/90 backdrop-blur-md shadow-2xl border border-white/20 animate-slide-up rounded-3xl">
                    <div className="card-body p-8">
                        {/* Tab Switcher */}
                        <div className="flex gap-2 p-1 bg-base-200 rounded-lg mb-6">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-300 ${isLogin
                                    ? 'bg-primary text-primary-content shadow-lg scale-105'
                                    : 'text-base-content/60 hover:text-base-content'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-300 ${!isLogin
                                    ? 'bg-primary text-primary-content shadow-lg scale-105'
                                    : 'text-base-content/60 hover:text-base-content'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error shadow-lg mb-4 animate-shake">
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name field (signup only) */}
                            {!isLogin && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Full Name</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="input input-bordered w-full pl-12 pr-4 h-12 bg-base-200/50 focus:bg-base-100 transition-all duration-300"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email field */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full pl-12 pr-4 h-12 bg-base-200/50 focus:bg-base-100 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Password</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full pl-12 pr-12 h-12 bg-base-200/50 focus:bg-base-100 transition-all duration-300"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password (login only) */}
                            {isLogin && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6"
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-md"></span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="divider text-base-content/40 text-xs">OR CONTINUE WITH</div>

                        {/* Social login buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        await googleLogin();
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : 'Google login failed');
                                    }
                                }}
                                className="btn btn-outline h-12 hover:scale-105 transition-transform"
                                type="button"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await appleLogin();
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : 'Apple login failed');
                                    }
                                }}
                                className="btn btn-outline h-12 hover:scale-105 transition-transform"
                                type="button"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.68.79 3.15 1.48-.02.01-1.88 1.1-1.86 3.29.02 2.62 2.3 3.49 2.33 3.52-.02.06-.36 1.25-1.19 2.47-.73 1.05-1.5 2.08-2.62 2.06v.21zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.38-2.12 4.19-3.74 4.25z" />
                                </svg>
                                Apple
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-base-content/60">
                    <p>
                        By continuing, you agree to our{' '}
                        <button className="text-primary hover:underline">Terms of Service</button>
                        {' '}and{' '}
                        <button className="text-primary hover:underline">Privacy Policy</button>
                    </p>
                </div>
            </div>
        </div>
    );
};
