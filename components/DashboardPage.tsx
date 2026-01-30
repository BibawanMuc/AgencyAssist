
import React from 'react';
import { Page } from '../types';
import {
  MessageSquare,
  Image as ImageIcon,
  Clapperboard,
  Layout,
  Tv,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Zap,
  Star,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { Language, translations } from '../translations';

interface DashboardPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentPage, language }) => {
  const s = translations[language].sidebar;
  const d = translations[language].dashboard;

  const { user } = useAuth();
  const userName = user?.displayName?.split(' ')[0] || 'Creator'; // First name or default

  const tools = [
    // ... existing tools array ...
    {
      id: Page.CHAT,
      title: s.chat,
      desc: s.chatDesc,
      icon: MessageSquare,
      color: 'from-blue-600 to-indigo-600',
      badge: d.toolBadges.logic,
      features: d.features.chat
    },
    {
      id: Page.THUMB_GEN,
      title: s.thumb,
      desc: s.thumbDesc,
      icon: Tv,
      color: 'from-red-600 to-rose-600',
      badge: d.toolBadges.click,
      features: d.features.thumb
    },
    {
      id: Page.STORY_GEN,
      title: s.story,
      desc: s.storyDesc,
      icon: Layout,
      color: 'from-amber-500 to-orange-600',
      badge: d.toolBadges.prod,
      features: d.features.story
    },
    {
      id: Page.IMAGE_GEN,
      title: s.image,
      desc: s.imageDesc,
      icon: ImageIcon,
      color: 'from-emerald-500 to-teal-600',
      badge: d.toolBadges.artisan,
      features: d.features.image
    },
    {
      id: Page.VIDEO_GEN,
      title: s.video,
      desc: s.videoDesc,
      icon: Clapperboard,
      color: 'from-violet-600 to-purple-700',
      badge: d.toolBadges.veo,
      features: d.features.video
    }
  ];

  return (
    <div className="space-y-16 py-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[4rem] p-12 lg:p-20 shadow-2xl flex md:flex-row flex-col items-center justify-between gap-12">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-3xl space-y-8 flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            {d.heroBadge}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95]">
            Unified <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">PX-AIssistent</span> Protocol.
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
            Willkommen <span className="text-indigo-400 font-bold">{userName}</span> bei PX-AIssistent. Deine umfassende Suite chirurgisch präziser KI-Tools, die Konzepte sofort in produktionsreife Assets verwandeln.
          </p>
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700/50">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">{d.secureEnv}</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700/50">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">{d.enginePowered}</span>
            </div>
          </div>
        </div>

        {/* User Avatar Box */}
        <div className="relative z-10 w-full md:w-[400px] aspect-square bg-slate-950 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden group shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={userName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <span className="text-9xl font-black text-slate-800 select-none">{userName.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-10 left-10">
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Active Session</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{user?.displayName || 'Creator'}</h3>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
            <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
            {d.toolEcosystem}
          </h2>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {d.selectOperation}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setCurrentPage(tool.id)}
              className="group relative bg-slate-900 border border-slate-800 rounded-[3rem] p-10 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-xl"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />

              <div className="relative z-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className={`p-5 rounded-3xl bg-gradient-to-br ${tool.color} shadow-2xl shadow-indigo-600/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <tool.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="px-4 py-1.5 bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-tighter text-slate-400 border border-slate-700">
                    {tool.badge}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">{tool.title}</h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <ul className="space-y-3 pt-2">
                  {tool.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400 transition-colors">
                      <Star className="w-3 h-3 text-indigo-500/50" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 flex items-center gap-2 text-indigo-500 text-sm font-black uppercase tracking-tighter group-hover:gap-4 transition-all">
                  {d.initWorkflow}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Tips / Meta */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-4">
          <h4 className="text-white font-black text-lg tracking-tight">{d.proTipTitle}</h4>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {d.proTipDesc}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-4">
          <h4 className="text-white font-black text-lg tracking-tight">{d.performance}</h4>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[98%]" />
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase">{d.loadReady}</span>
          </div>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">{d.clustersResponsive}</p>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
