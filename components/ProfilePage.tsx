import React, { useState, useRef } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { updateUserMetadata, updateUserPassword } from '../src/services/auth';
import { updateUserProfile } from '../src/services/supabase-db';
import { uploadFile, generateAssetPath } from '../src/services/supabase-storage';
import { Language, translations } from '../translations';
import { User, Camera, Shield, Save, Loader2, Key } from 'lucide-react';

interface ProfilePageProps {
    language: Language;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ language }) => {
    const { user } = useAuth();
    const t = translations[language].profile;
    const tCommon = translations[language].common;

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);
        setMessage(null);

        try {
            const path = generateAssetPath('avatars', file.name.split('.').pop() || 'png');
            const publicUrl = await uploadFile(file, path);
            setAvatarUrl(publicUrl);
        } catch (error: any) {
            console.error('Upload failed:', error);
            setMessage({ type: 'error', text: error.message || tCommon.error });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        setMessage(null);

        try {
            // 1. Update Auth Metadata (so it reflects in UI immediately)
            await updateUserMetadata({
                displayName,
                photoURL: avatarUrl
            });

            // 2. Update Profiles Table (for persistence logic)
            await updateUserProfile(user.uid, {
                full_name: displayName,
                avatar_url: avatarUrl
            });

            setMessage({ type: 'success', text: t.success });
            // Reload page to refresh Auth Context if needed, or rely on internal state
            // window.location.reload(); 
        } catch (error: any) {
            console.error('Profile update failed:', error);
            setMessage({ type: 'error', text: error.message || tCommon.error });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' }); // Translation?
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsSavingPassword(true);
        setMessage(null);

        try {
            await updateUserPassword(newPassword);
            setMessage({ type: 'success', text: t.passwordSuccess });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password update failed:', error);
            setMessage({ type: 'error', text: error.message || tCommon.error });
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {t.title}
                </h2>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Public Profile Section */}
            <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <User className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-200">{t.publicProfile}</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 shadow-xl">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                        <User className="w-12 h-12 text-slate-600" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white shadow-lg hover:bg-indigo-500 transition-colors border-4 border-slate-900"
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                        <p className="text-xs text-slate-500">{t.changeAvatar}</p>
                    </div>

                    {/* Details form */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t.displayName}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full bg-slate-900/50 border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isSavingProfile}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {tCommon.save}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-200">{t.security}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.newPassword}</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.confirmPassword}</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleUpdatePassword}
                        disabled={isSavingPassword || !newPassword}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        {t.updatePassword}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
