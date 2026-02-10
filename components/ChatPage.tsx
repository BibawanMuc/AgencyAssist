
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage, BotType } from '../types';
import { createChat, generateChatTitle, getAI, BOT_INSTRUCTIONS, getOnboardingInstruction } from '../services/gemini';
import {
  Send,
  Plus,
  Search,
  MessageSquare,
  Bot,
  User,
  Users,
  Key,
  X,
  Code2,
  PenTool,
  Zap,
  Sparkles,
  Trash2,
  Loader2,
  Paperclip,
  FileText,
  FileSearch,
  Image as ImageIcon,
  LogOut
} from 'lucide-react';
import { Language, translations } from '../translations';
import { saveChatSession, getChatSessions, deleteChatSession } from '../src/services/supabase-db';
import { supabase } from '../src/config/supabase';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatPageProps {
  language: Language;
}

const ChatPage: React.FC<ChatPageProps> = ({ language }) => {
  const t = translations[language].chat;
  const tc = translations[language].common;

  const BOTS_CONFIG = {
    [BotType.NORMAL]: {
      name: t.bots.normal.name,
      description: t.bots.normal.desc,
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      model: 'gemini-3-flash-preview',
      system: BOT_INSTRUCTIONS[BotType.NORMAL]
    },
    [BotType.CODING]: {
      name: t.bots.coding.name,
      description: t.bots.coding.desc,
      icon: Code2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      model: 'gemini-3-pro-preview',
      system: BOT_INSTRUCTIONS[BotType.CODING]
    },
    [BotType.CONTENT]: {
      name: t.bots.content.name,
      description: t.bots.content.desc,
      icon: PenTool,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      model: 'gemini-3-pro-preview',
      system: BOT_INSTRUCTIONS[BotType.CONTENT]
    },
    [BotType.ANALYSIS]: {
      name: t.bots.analysis.name,
      description: t.bots.analysis.desc,
      icon: FileSearch,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      model: 'gemini-3-pro-preview',
      system: BOT_INSTRUCTIONS[BotType.ANALYSIS]
    },
    [BotType.ONBOARDING]: {
      name: t.bots.onboarding.name,
      description: t.bots.onboarding.desc,
      icon: Users,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      model: 'gemini-3-pro-preview',
      system: undefined // Will be loaded dynamically
    }
  };

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedBotType, setSelectedBotType] = useState<BotType>(BotType.NORMAL);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions from Supabase on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const loadedSessions = await getChatSessions();
      setSessions(loadedSessions);
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      // Optional: setError(t.errors.loadFailed);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [sessions, activeSessionId, isLoading]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeBot = activeSession ? BOTS_CONFIG[activeSession.botId] : BOTS_CONFIG[selectedBotType];

  const startNewChat = async (botId: BotType) => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: 'New ' + BOTS_CONFIG[botId].name + ' Chat',
      botId: botId,
      messages: [],
      timestamp: Date.now()
    };

    // Optimistic update
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setSelectedBotType(botId);

    // Save to DB
    try {
      await saveChatSession(newSession);
    } catch (err) {
      console.error('Failed to create new session:', err);
      setError('Failed to create new chat session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    // Optimistic update
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }

    try {
      await deleteChatSession(sessionId);
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete chat session');
      // Revert on error could be implemented here
      loadSessions();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachment({
          data: base64,
          mimeType: file.type || 'application/octet-stream',
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !attachment) return;
    if (!activeSessionId) return;
    setError(null);

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError(t.subtitle);
      return;
    }

    const userMessage = input;
    const currentAttachment = attachment;
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    const updatedSessions = [...sessions];
    const sessionIndex = updatedSessions.findIndex(s => s.id === activeSessionId);

    if (sessionIndex !== -1) {
      const botConfig = BOTS_CONFIG[updatedSessions[sessionIndex].botId];

      // Add User Message
      updatedSessions[sessionIndex].messages.push({
        role: 'user',
        text: userMessage || (currentAttachment ? `Analyze this file: ${currentAttachment.name}` : ''),
        attachment: currentAttachment || undefined
      });
      setSessions([...updatedSessions]);

      // Save user message to DB
      saveChatSession(updatedSessions[sessionIndex]).catch(err => console.error("Failed to save user message", err));

      try {
        const ai = getAI();
        let responseText = "";

        // Load dynamic system instruction for onboarding bot
        let systemInstruction = botConfig.system;
        if (updatedSessions[sessionIndex].botId === BotType.ONBOARDING) {
          systemInstruction = await getOnboardingInstruction();
        }

        // Branch: If we have an attachment or if it's the analysis/onboarding bot, use generateContent for context
        // Otherwise, use the standard chat object for speed/simplicity
        if (currentAttachment || updatedSessions[sessionIndex].botId === BotType.ANALYSIS || updatedSessions[sessionIndex].botId === BotType.ONBOARDING) {
          const history = updatedSessions[sessionIndex].messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));

          const userParts: any[] = [];
          if (currentAttachment) {
            userParts.push({
              inlineData: {
                data: currentAttachment.data,
                mimeType: currentAttachment.mimeType
              }
            });
          }
          userParts.push({ text: userMessage || (currentAttachment ? "Explain this file." : "Hello") });

          const response = await ai.models.generateContent({
            model: botConfig.model,
            contents: [...history, { role: 'user', parts: userParts }],
            config: {
              systemInstruction: systemInstruction
            }
          });
          responseText = response.text || "I'm sorry, I couldn't process that.";
        } else {
          // Standard chat path
          const chat = createChat(systemInstruction, botConfig.model);
          const response = await chat.sendMessage({ message: userMessage });
          responseText = response.text || "I'm sorry, I couldn't process that.";
        }

        // Add Model Response
        updatedSessions[sessionIndex].messages.push({
          role: 'model',
          text: responseText
        });

        if (updatedSessions[sessionIndex].messages.filter(m => m.role === 'user').length === 1) {
          const title = await generateChatTitle(userMessage || currentAttachment?.name || "File Analysis");
          updatedSessions[sessionIndex].title = title;
        }

        setSessions([...updatedSessions]);

        // Save complete turn to DB
        await saveChatSession(updatedSessions[sessionIndex]);

      } catch (err: any) {
        console.error("Chat error:", err);
        if (err.message?.includes("Requested entity was not found")) {
          setError("Model version not available for current API Key. Retrying with basic model...");
        } else if (err.message?.includes("403") || err.message?.includes("API key was reported as leaked")) {
          setError("⚠️ CRITICAL: Your Gemini API Key is blocked/leaked. Please generate a new key and update your .env file.");
        } else {
          setError(tc.error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 mb-2">{t.newGen}</p>
          {(Object.entries(BOTS_CONFIG) as [BotType, typeof BOTS_CONFIG[BotType]][]).map(([type, config]) => (
            <button
              key={type}
              onClick={() => startNewChat(type)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-800 hover:bg-indigo-600 transition-all group text-left shadow-lg border border-transparent hover:border-indigo-400"
            >
              <div className={`p-2 rounded-xl bg-slate-900 group-hover:bg-white/10 transition-colors`}>
                <config.icon className={`w-5 h-5 ${config.color} group-hover:text-white`} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-200 group-hover:text-white">{config.name}</p>
                <p className="text-[10px] text-slate-500 group-hover:text-indigo-100 truncate">{config.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-800 p-4 overflow-y-auto shadow-inner">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 mb-4">{t.history}</p>

          <div className="space-y-1">
            {sessions.map(session => {
              const BotIcon = BOTS_CONFIG[session.botId]?.icon || MessageSquare;
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${activeSessionId === session.id
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                >
                  <BotIcon className={`w-4 h-4 flex-shrink-0 ${activeSessionId === session.id ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-bold truncate">{session.title}</span>
                </button>
              );
            })}
            {sessions.length === 0 && (
              <div className="py-8 text-center opacity-20">
                <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                <p className="text-[10px] font-bold">{t.noSessions}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800 hover:border-red-500/30 transition-all text-left group"
        >
          <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        {error && (
          <div className="absolute top-6 left-6 right-6 z-50 bg-red-500/90 backdrop-blur-xl text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl border border-white/10">
            <span className="text-sm font-bold">{error}</span>
            <X className="w-5 h-5 cursor-pointer" onClick={() => setError(null)} />
          </div>
        )}

        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-6">
            <div className="relative">
              <Bot className="w-24 h-24 opacity-5" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-indigo-500/20 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-300 tracking-tighter">{t.title}</h2>
              <p className="max-w-xs mt-2 text-slate-500 font-medium">{t.subtitle}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${activeBot.bgColor} flex items-center justify-center shadow-inner`}>
                  <activeBot.icon className={`w-7 h-7 ${activeBot.color}`} />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 tracking-tight">{activeSession.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.active}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => deleteSession(activeSession.id)}
                  className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
              <div className="flex justify-center mb-8">
                <div className="bg-slate-800/30 border border-slate-800 px-6 py-3 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {t.secure}
                </div>
              </div>

              {activeSession.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-slate-800' : activeBot.bgColor
                    }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-slate-400" /> : <activeBot.icon className={`w-5 h-5 ${activeBot.color}`} />}
                  </div>
                  <div className={`max-w-[75%] space-y-4`}>
                    {msg.attachment && (
                      <div className={`p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3 shadow-xl ${msg.role === 'user' ? 'mr-auto' : 'ml-auto'}`}>
                        {msg.attachment.mimeType.startsWith('image/') ? (
                          <img src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} className="w-12 h-12 object-cover rounded-lg" alt="Attachment" />
                        ) : (
                          <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-indigo-400" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-200 truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black">{msg.attachment.mimeType.split('/')[1]}</p>
                        </div>
                      </div>
                    )}
                    <div className={`rounded-3xl p-5 text-sm leading-relaxed shadow-2xl transition-all ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/50 text-slate-200 rounded-tl-none border border-slate-700/50 backdrop-blur-sm'
                      }`}>
                      {msg.role === 'user' ? (
                        msg.text
                      ) : (
                        <MarkdownRenderer content={msg.text} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-5 animate-in fade-in slide-in-from-bottom-2">
                  <div className={`w-10 h-10 rounded-2xl ${activeBot.bgColor} flex items-center justify-center shrink-0 animate-pulse shadow-lg`}>
                    <activeBot.icon className={`w-5 h-5 ${activeBot.color}`} />
                  </div>
                  <div className="bg-slate-800/50 rounded-3xl rounded-tl-none p-5 text-sm text-slate-500 italic flex items-center gap-3 border border-slate-700/30">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    {activeBot.name} {t.synthesizing}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 space-y-4">
              {attachment && (
                <div className="flex items-center gap-3 p-3 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl w-fit animate-in slide-in-from-bottom-2">
                  {attachment.mimeType.startsWith('image/') ? (
                    <img src={`data:${attachment.mimeType};base64,${attachment.data}`} className="w-10 h-10 object-cover rounded-lg" alt="Preview" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{attachment.name}</p>
                    <p className="text-[10px] text-indigo-400 font-black uppercase">Ready for analysis</p>
                  </div>
                  <button onClick={() => setAttachment(null)} className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="relative group flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,text/plain"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-[2rem] border border-slate-700 transition-all flex items-center justify-center shadow-inner active:scale-95"
                  title="Upload image or document"
                >
                  <Paperclip className="w-6 h-6" />
                </button>

                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`${t.placeholder} ${activeBot.name}...`}
                    className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-[2rem] px-8 py-5 pr-20 text-slate-100 focus:ring-0 focus:border-indigo-500 transition-all placeholder:text-slate-600 font-medium relative z-10 text-lg shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={(!input.trim() && !attachment) || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:bg-slate-700 text-white rounded-2xl transition-all shadow-xl shadow-indigo-600/20 z-20 active:scale-90"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </form>
              <p className="text-[10px] text-slate-600 mt-4 text-center font-black uppercase tracking-[0.3em]">{t.authOnly}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
