import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth';
import { Mail, Send, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!email) {
            setError('Bitte geben Sie Ihre E-Mail-Adresse ein');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(email);
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
                        <Mail className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100">
                        Passwort zurücksetzen
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts
                    </p>
                </div>

                {/* Success Message */}
                {success ? (
                    <div className="space-y-6">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 flex flex-col items-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-400" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-green-300 mb-2">
                                    E-Mail gesendet!
                                </h3>
                                <p className="text-sm text-green-200">
                                    Wir haben Ihnen eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts gesendet.
                                    Bitte überprüfen Sie Ihr Postfach.
                                </p>
                                <p className="text-xs text-green-300 mt-3">
                                    Hinweis: Die E-Mail kann einige Minuten dauern. Überprüfen Sie auch Ihren Spam-Ordner.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Zurück zum Login</span>
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
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    E-Mail-Adresse
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="ihre@email.com"
                                    />
                                </div>
                            </div>
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
                                    <span>Wird gesendet...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    <span>Link senden</span>
                                </>
                            )}
                        </button>

                        {/* Back to Login Link */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Zurück zum Login</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
