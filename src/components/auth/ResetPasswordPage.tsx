import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePasswordWithToken } from '../../services/auth';
import { Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check if we have a valid session (user clicked email link)
    useEffect(() => {
        // If user successfully reset password, redirect after 3 seconds
        if (success) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 6) {
            return 'Das Passwort muss mindestens 6 Zeichen lang sein';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password || !confirmPassword) {
            setError('Bitte füllen Sie alle Felder aus');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Die Passwörter stimmen nicht überein');
            return;
        }

        try {
            setIsLoading(true);
            await updatePasswordWithToken(password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100">
                        Neues Passwort setzen
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Geben Sie Ihr neues Passwort ein
                    </p>
                </div>

                {/* Success Message */}
                {success ? (
                    <div className="space-y-6">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 flex flex-col items-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-400" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-green-300 mb-2">
                                    Passwort erfolgreich geändert!
                                </h3>
                                <p className="text-sm text-green-200">
                                    Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
                                </p>
                                <p className="text-xs text-green-300 mt-3">
                                    Sie werden in wenigen Sekunden zur Login-Seite weitergeleitet...
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            Jetzt anmelden
                        </button>
                    </div>
                ) : (
                    /* Form */
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Neues Passwort
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="Mindestens 6 Zeichen"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                    Passwort bestätigen
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="Passwort wiederholen"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="text-xs text-slate-400">
                                    {password.length < 6 && (
                                        <p className="text-yellow-400">⚠️ Passwort zu kurz (mindestens 6 Zeichen)</p>
                                    )}
                                    {password.length >= 6 && password.length < 10 && (
                                        <p className="text-blue-400">✓ Passwort akzeptabel</p>
                                    )}
                                    {password.length >= 10 && (
                                        <p className="text-green-400">✓ Starkes Passwort</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Wird gespeichert...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Passwort ändern</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
