
import React, { useState, useRef, useEffect } from 'react';
import { generateImage, generateShotlist, generateVideo } from '../services/gemini';
import {
  saveStoryboardSession,
  getStoryboardSessions as getAllStoryboardSessions,
  deleteStoryboardSession
} from '../src/services/supabase-db';
import { uploadBase64Image, uploadFile, generateAssetPath } from '../src/services/supabase-storage';
import {
  Layout,
  Plus,
  Loader2,
  Trash2,
  X,
  Sparkles,
  RefreshCw,
  Download,
  Edit3,
  ChevronRight,
  Monitor,
  FileText,
  User,
  Box,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Mic,
  FileDown,
  Clapperboard,
  FolderOpen,
  Database,
  Check,
  History,
  Pen,
  Camera
} from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { useAuth } from '../src/contexts/AuthContext';
import { StoryboardShot, StoryboardAsset, ImageModel, StoryboardConfig, StoryboardSession, VideoModel } from '../types';
import { Language, translations } from '../translations';

interface StoryGenPageProps {
  language: Language;
}

const STORY_STYLES = [
  { id: 'cinematic', name: 'Cinematic Movie', prompt: 'Cinematic lighting, high fidelity, professional film storyboard, anamorphic lens flares' },
  { id: 'anime', name: 'Modern Anime', prompt: 'Studio Ghibli meets Makoto Shinkai style, vibrant lighting, highly detailed cel shading' },
  { id: 'noir', name: 'Film Noir', prompt: 'High contrast black and white, dramatic shadows, moody lighting, smoke and rain textures' },
  { id: '3d', name: 'Pixar-like 3D', prompt: 'High-end 3D character animation render, soft shadows, subsurface scattering, cute aesthetics' },
  { id: 'sketch', name: 'Traditional Sketch', prompt: 'Rough pencil sketch on paper, charcoal textures, artistic, rough storyboard lines' },
];

const StoryGenPage: React.FC<StoryGenPageProps> = ({ language }) => {
  const ts = translations[language].story;

  // Session Management
  const [sessions, setSessions] = useState<StoryboardSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Active Project State
  const [concept, setConcept] = useState('');
  const [targetDuration, setTargetDuration] = useState<number | ''>('');
  const [numShots, setNumShots] = useState<number | ''>('');
  const [assets, setAssets] = useState<StoryboardAsset[]>([
    { id: 'c1', name: 'Protagonist', type: 'character', isSelected: true, prompt: '' },
    { id: 'c2', name: 'Sidekick', type: 'character', isSelected: false, prompt: '' },
    { id: 'o1', name: 'Hero Item', type: 'object', isSelected: false, prompt: '' },
  ]);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [config, setConfig] = useState<StoryboardConfig>({ style: STORY_STYLES[0].id, aspectRatio: '16:9' });

  const [isBuildingShotlist, setIsBuildingShotlist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ImageModel>(ImageModel.FLASH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const cancelledShotsRef = useRef<Set<string>>(new Set());
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const activeStyle = STORY_STYLES.find(s => s.id === config.style) || STORY_STYLES[0];

  // Webcam State
  const [showWebcam, setShowWebcam] = useState<{ active: boolean, assetId: string | null }>({ active: false, assetId: null });

  const handleWebcamCapture = async (base64Image: string) => {
    if (!showWebcam.assetId) return;

    // Create a Blob from base64
    const res = await fetch(base64Image);
    const blob = await res.blob();
    const file = new File([blob], `webcam-${Date.now()}.png`, { type: 'image/png' });

    // Upload immediately
    const processUpload = async () => {
      try {
        const path = generateAssetPath('uploads', 'png');
        const publicUrl = await uploadFile(file, path);
        setAssets(prev => prev.map(a => a.id === showWebcam.assetId ? { ...a, imageUrl: publicUrl } : a));
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to upload webcam capture.");
      }
    };
    processUpload();
    setShowWebcam({ active: false, assetId: null });
  };

  const { signOut } = useAuth();

  // Load from Supabase on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const historyData = await getAllStoryboardSessions();
        if (historyData && historyData.length > 0) {
          setSessions(historyData);
          loadSession(historyData[0]);
        } else {
          startNewProject();
        }
        setIsDbReady(true);
      } catch (e: any) {
        console.error("DB Load Error", e);
        if (e.message?.includes('Not authenticated') || e.message?.includes('403')) {
            signOut();
            return;
        }
        startNewProject();
      }
    };
    init();
  }, []);

  // Persistence Auto-Save to Supabase (Debounced)
  useEffect(() => {
    if (!activeSessionId || !isDbReady) return;

    const timer = setTimeout(async () => {
      const updatedSession: StoryboardSession = {
        id: activeSessionId,
        title: concept.substring(0, 30) || 'Untitled Project',
        concept,
        targetDuration,
        numShots,
        assets,
        shots,
        config,
        timestamp: Date.now()
      };

      try {
        await saveStoryboardSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
      } catch (e: any) {
        console.error("Critical: Failed to save to Supabase.", e);
        if (e.message?.includes('Not authenticated') || e.message?.includes('403')) {
            signOut();
        }
        setError("Database error: Could not save assets.");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [concept, targetDuration, numShots, assets, shots, config, activeSessionId, isDbReady]);

  const loadSession = (session: StoryboardSession) => {
    setActiveSessionId(session.id);
    setConcept(session.concept);
    setTargetDuration(session.targetDuration);
    setNumShots(session.numShots);
    setAssets(session.assets);
    setShots(session.shots);
    setConfig(session.config);
  };

  const startNewProject = () => {
    const newSession: StoryboardSession = {
      id: crypto.randomUUID(),
      title: 'Untitled Project',
      concept: '',
      targetDuration: '',
      numShots: '',
      assets: [
        { id: 'c1', name: 'Protagonist', type: 'character', isSelected: true, prompt: '' },
        { id: 'c2', name: 'Sidekick', type: 'character', isSelected: false, prompt: '' },
        { id: 'o1', name: 'Hero Item', type: 'object', isSelected: false, prompt: '' },
      ],
      shots: [],
      config: { style: STORY_STYLES[0].id, aspectRatio: '16:9' },
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    loadSession(newSession);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteStoryboardSession(id);
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      if (activeSessionId === id && updated.length > 0) {
        loadSession(updated[0]);
      } else if (updated.length === 0) {
        startNewProject();
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleAssetUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload immediately
      const processUpload = async () => {
        try {
          const path = generateAssetPath('uploads', file.name.split('.').pop());
          const publicUrl = await uploadFile(file, path);
          setAssets(prev => prev.map(a => a.id === id ? { ...a, imageUrl: publicUrl } : a));
        } catch (err) {
          console.error("Upload failed", err);
          setError("Failed to upload asset image.");
        }
      };
      processUpload();
    }
  };

  const generateAssetImage = async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    setAssets(prev => prev.map(a => a.id === id ? { ...a, isGenerating: true } : a));
    try {
      const userPromptPart = asset.prompt ? `${asset.prompt}. ` : "";
      const prompt = `Professional ${asset.type} design: ${userPromptPart}${asset.name}. Style: ${activeStyle.prompt}. Full body view, neutral background.`;
      const dataUri = await generateImage(prompt, model, "1:1");

      if (dataUri) {
        // Upload to Supabase
        const path = generateAssetPath('assets', 'png');
        const publicUrl = await uploadBase64Image(dataUri, path);
        setAssets(prev => prev.map(a => a.id === id ? { ...a, imageUrl: publicUrl, isGenerating: false } : a));
      }
    } catch (err: any) {
      setError(err.message || "Asset generation failed.");
      setAssets(prev => prev.map(a => a.id === id ? { ...a, isGenerating: false } : a));
    }
  };

  const toggleAssetSelection = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, isSelected: !a.isSelected } : a));
  };

  const buildShotlist = async () => {
    if (!concept) return;
    setIsBuildingShotlist(true);
    setError(null);
    try {
      const assetsInfo = assets.filter(a => a.isSelected).map(a => a.name).join(', ');
      const list = await generateShotlist(concept, assetsInfo, typeof targetDuration === 'number' ? targetDuration : undefined, typeof numShots === 'number' ? numShots : undefined);
      shots.forEach(s => { if (s.videoUrl && s.videoUrl.startsWith('blob:')) URL.revokeObjectURL(s.videoUrl); });
      setShots(list.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9), isGenerating: false, isGeneratingVideo: false })));
    } catch (err: any) {
      setError("Failed to architect narrative sequence.");
    } finally {
      setIsBuildingShotlist(false);
    }
  };

  const stopGeneration = (id: string) => {
    cancelledShotsRef.current.add(id);
    setShots(prev => prev.map(s => s.id === id ? { ...s, isGenerating: false, isGeneratingVideo: false } : s));
  };

  const generateFrame = async (id: string) => {
    cancelledShotsRef.current.delete(id);
    const shot = shots.find(s => s.id === id);
    if (!shot) return;
    setShots(prev => prev.map(s => s.id === id ? { ...s, isGenerating: true } : s));

    try {
      // Gather visual references from the Cast assets that have images and are selected
      const visualRefs = assets
        .filter(a => a.isSelected && a.imageUrl)
        .map(a => {
          return { url: a.imageUrl! };
        });

      // We need to resolve these URLs to base64 for Gemini
      const resolvedRefs: { data: string, mimeType: string }[] = [];
      for (const ref of visualRefs) {
        if (ref.url.startsWith('data:')) {
          const parts = ref.url.split(',');
          const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
          resolvedRefs.push({ data: parts[1], mimeType });
        } else {
          try {
            const resp = await fetch(ref.url);
            const blob = await resp.blob();
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            const parts = base64.split(',');
            resolvedRefs.push({ data: parts[1], mimeType: blob.type });
          } catch (e) {
            console.error("Failed to fetch ref image", e);
          }
        }
      }

      const prompt = `Storyboard frame: ${shot.frameDescription}. Context: ${shot.sceneDescription}. Style: ${activeStyle.prompt}. Please ensure visual consistency with the provided character/object references.`;

      const dataUri = await generateImage(
        prompt,
        model,
        config.aspectRatio,
        resolvedRefs.length > 0 ? resolvedRefs : undefined
      );

      if (!cancelledShotsRef.current.has(id) && dataUri) {
        // Upload frame to Supabase
        const path = generateAssetPath('frames', 'png');
        const publicUrl = await uploadBase64Image(dataUri, path);
        setShots(prev => prev.map(s => s.id === id ? { ...s, imageUrl: publicUrl, isGenerating: false } : s));
      }
    } catch (err: any) {
      setError(err.message || "Frame synthesis failed.");
      setShots(prev => prev.map(s => s.id === id ? { ...s, isGenerating: false } : s));
    }
  };

  const generateClipForShot = async (id: string) => {
    const shot = shots.find(s => s.id === id);
    if (!shot) return;
    if (shot.videoUrl && shot.videoUrl.startsWith('blob:')) URL.revokeObjectURL(shot.videoUrl);
    setShots(prev => prev.map(s => s.id === id ? { ...s, isGeneratingVideo: true } : s));
    setError(null);
    try {
      const videoPrompt = `Cinematic video: ${shot.frameDescription}. Narrative: ${shot.sceneDescription}. Style: ${activeStyle.name}.`;

      // Resolve Use Ref Image
      let imgRef: { data: string, mimeType: string } | undefined = undefined;
      if (shot.imageUrl) {
        if (shot.imageUrl.startsWith('data:')) {
          const parts = shot.imageUrl.split(',');
          imgRef = { data: parts[1], mimeType: 'image/png' };
        } else {
          // Fetch from URL
          try {
            const resp = await fetch(shot.imageUrl);
            const blob = await resp.blob();
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            const parts = base64.split(',');
            imgRef = { data: parts[1], mimeType: blob.type };
          } catch (e) {
            console.error("Failed to fetch shot image for video gen", e);
          }
        }
      }

      const blobUrl = await generateVideo(videoPrompt, VideoModel.FAST, imgRef, config.aspectRatio as any);

      if (blobUrl) {
        // Upload video
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const path = generateAssetPath('clips', 'mp4');
        const publicUrl = await uploadFile(blob, path);

        setShots(prev => prev.map(s => s.id === id ? { ...s, videoUrl: publicUrl, isGeneratingVideo: false } : s));
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err: any) {
      setError("Video synthesis failed.");
      setShots(prev => prev.map(s => s.id === id ? { ...s, isGeneratingVideo: false } : s));
    }
  };

  const moveShot = (index: number, direction: 'up' | 'down') => {
    const newShots = [...shots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newShots.length) {
      [newShots[index], newShots[targetIndex]] = [newShots[targetIndex], newShots[index]];
      setShots(newShots);
    }
  };

  const downloadProductionSheet = () => {
    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Production Sheet</title><style>body{font-family:sans-serif;padding:40px;background:#f8fafc;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:12px;text-align:left}img{width:220px;border-radius:12px;}</style></head><body>
      <h1>Production Sheet: ${concept.substring(0, 50) || 'Storyboard'}</h1><p>Style: ${activeStyle.name}</p><table><tr><th>Shot</th><th>Visual</th><th>Action</th><th>Direction</th><th>Text</th><th>Time</th></tr>
      ${shots.map((s, i) => `<tr><td>${i + 1}</td><td>${s.imageUrl ? `<img src="${s.imageUrl}">` : '-'}</td><td>${s.sceneDescription}</td><td>${s.frameDescription}</td><td>${s.voiceText}</td><td>${s.duration}s</td></tr>`).join('')}
      </table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `production-sheet-${Date.now()}.html`;
    link.click();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden">
      {/* Sidebar History */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} flex flex-col gap-4 transition-all duration-300 shrink-0`}>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col h-full shadow-2xl">
          <div className="flex items-center justify-between px-2 mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History className="w-3 h-3" /> Project History
            </p>
            <button onClick={startNewProject} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {sessions.map(s => (
              <div key={s.id} onClick={() => loadSession(s)} className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${activeSessionId === s.id ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800/30 border-transparent text-slate-400 hover:bg-slate-800/50'}`}>
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold truncate flex-1">{s.title || 'Untitled'}</span>
                <button onClick={(e) => handleDeleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
              <Database className="w-3 h-3" />
              <span>Supabase Cloud Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-slate-800 backdrop-blur-3xl shadow-2xl relative">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -left-3 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 p-2 rounded-full text-slate-400 z-50 transition-all hover:scale-110">{isSidebarOpen ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}</button>
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tighter">StoryGen <span className="text-indigo-400">Master</span></h1>
            <p className="text-slate-400 font-semibold">Unlimited visualization storage powered by Supabase Cloud.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-slate-800/40 p-4 rounded-[2rem] border border-slate-700/50">
            <select value={config.style} onChange={(e) => setConfig({ ...config, style: e.target.value })} className="bg-slate-900 text-xs font-black border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none">
              {STORY_STYLES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="bg-slate-900 rounded-2xl p-1 flex">
              <button onClick={() => setModel(ImageModel.FLASH)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${model === ImageModel.FLASH ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Flash</button>
              <button onClick={() => setModel(ImageModel.PRO)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${model === ImageModel.PRO ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Pro</button>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl flex items-center justify-between text-red-400 font-bold"><div className="flex items-center gap-4"><X className="w-6 h-6 p-1.5 bg-red-500/20 rounded-full cursor-pointer" onClick={() => setError(null)} /> {error}</div></div>}

        {/* STEP 1 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-4"><User className="w-6 h-6 text-indigo-400" /> Step 1: Cast Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {assets.map((asset) => (
              <div key={asset.id} className={`bg-slate-900 border ${asset.isSelected ? 'border-indigo-500' : 'border-slate-800 opacity-60'} rounded-[3rem] p-8 space-y-6 hover:border-indigo-500/40 transition-all shadow-2xl relative overflow-hidden`}>
                <div className="flex items-center justify-between relative z-20">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleAssetSelection(asset.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${asset.isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-800'}`}>{asset.isSelected && <Check className="w-4 h-4" />}</button>
                    <input value={asset.name} onChange={(e) => setAssets(assets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a))} className="bg-transparent text-xl font-black text-slate-100 outline-none w-full" placeholder="Name..." />
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${asset.isSelected ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>{asset.type === 'character' ? <User className="w-5 h-5" /> : <Box className="w-5 h-5" />}</div>
                </div>

                <div className="space-y-2 relative z-20">
                  <label className="text-[9px] font-black text-slate-500 uppercase px-1 tracking-[0.2em] flex items-center gap-2">
                    <Pen className="w-3 h-3" /> {ts.assetPrompt}
                  </label>
                  <textarea
                    value={asset.prompt || ''}
                    onChange={(e) => setAssets(assets.map(a => a.id === asset.id ? { ...a, prompt: e.target.value } : a))}
                    className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-xs text-slate-300 h-16 resize-none focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="E.g. wearing a blue spacesuit with glowing visor..."
                  />
                </div>

                <div className="aspect-square bg-slate-950 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative border border-slate-800 shadow-inner group/img z-20">
                  {asset.imageUrl ? <img src={asset.imageUrl} className="w-full h-full object-cover" alt={asset.name} /> : <div className="text-slate-800 flex flex-col items-center gap-4">{asset.isGenerating ? <Loader2 className="w-12 h-12 animate-spin text-indigo-500" /> : <ImageIcon className="w-16 h-16 opacity-5" />}</div>}
                  <div className="absolute inset-x-6 bottom-6 flex gap-2 translate-y-4 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-300">
                    <button onClick={() => fileInputRefs.current[asset.id]?.click()} className="flex-1 py-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-[10px] font-black uppercase border border-white/10">Upload</button>
                    <button onClick={() => setShowWebcam({ active: true, assetId: asset.id })} className="flex-1 py-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-[10px] font-black uppercase border border-white/10"><Camera className="w-4 h-4 mx-auto" /></button>
                    <button onClick={() => generateAssetImage(asset.id)} disabled={asset.isGenerating} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-xl">{asset.isGenerating ? 'Drawing...' : 'AI Draw'}</button>
                  </div>
                </div>
                <input type="file" ref={el => { fileInputRefs.current[asset.id] = el; }} onChange={(e) => handleAssetUpload(asset.id, e)} accept="image/*" className="hidden" />
              </div>
            ))}
          </div>
        </section>

        {/* STEP 2 */}
        <section className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl space-y-10">
          <div className="flex items-center gap-4 text-white mb-4"><FileText className="w-6 h-6 text-indigo-400" /><h2 className="text-2xl font-black">{ts.step2Title}</h2></div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">Concept</label><textarea value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-[2rem] px-8 py-6 text-white h-40 resize-none text-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="A space explorer finds a hidden valley..." /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{ts.targetDuration}</label><div className="bg-slate-800 border-slate-700 rounded-[2rem] h-40 flex flex-col items-center justify-center"><input type="number" value={targetDuration} onChange={(e) => setTargetDuration(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-transparent text-center text-4xl font-black text-indigo-400 outline-none" placeholder="Auto" /></div></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{ts.numShots}</label><div className="bg-slate-800 border-slate-700 rounded-[2rem] h-40 flex flex-col items-center justify-center"><input type="number" value={numShots} onChange={(e) => setNumShots(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-transparent text-center text-4xl font-black text-violet-400 outline-none" placeholder="Auto" /></div></div>
          </div>
          <button onClick={buildShotlist} disabled={isBuildingShotlist || !concept} className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] text-2xl font-black flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95">{isBuildingShotlist ? <Loader2 className="animate-spin w-8 h-8" /> : <Sparkles className="w-8 h-8" />} Generate Sequence</button>
        </section>

        {/* STEP 3 */}
        {shots.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-center justify-between sticky top-6 z-50 bg-slate-950/90 backdrop-blur-xl py-5 rounded-[2.5rem] px-10 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-black text-white flex items-center gap-4"><Monitor className="w-5 h-5 text-indigo-400" /> Visualization Pipeline</h2>
              <button onClick={downloadProductionSheet} className="px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><FileDown className="w-4 h-4" /> Export Production Sheet</button>
            </div>
            <div className="space-y-8">
              {shots.map((shot, idx) => (
                <div key={shot.id} className="group flex flex-col lg:flex-row bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl hover:border-indigo-500/40 transition-all">
                  <div className="lg:w-2/5 aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden border-r border-slate-800">
                    {shot.videoUrl ? <video src={shot.videoUrl} controls autoPlay loop className="w-full h-full object-cover" /> : shot.imageUrl ? <img src={shot.imageUrl} className="w-full h-full object-cover" alt="Frame" /> : <Layout className="w-20 h-20 opacity-10 text-indigo-400" />}
                    {(shot.isGenerating || shot.isGeneratingVideo) && <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /><p className="text-[10px] font-black uppercase tracking-widest animate-pulse">{shot.isGeneratingVideo ? 'Synthesizing Clip' : 'Synthesizing Frame'}</p><button onClick={() => stopGeneration(shot.id)} className="mt-4 px-6 py-2 bg-red-600/20 text-red-400 rounded-xl text-[10px] font-black uppercase border border-red-500/50">Stop</button></div>}
                    <div className="absolute top-6 left-6 flex gap-2"><div className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-full">SHOT {idx + 1}</div><div className="bg-black/80 text-white text-[10px] font-black px-4 py-2 rounded-full">{shot.duration}s</div></div>
                    <div className="absolute bottom-6 left-6 flex gap-3 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => generateFrame(shot.id)} className="p-4 bg-indigo-600 text-white rounded-2xl"><RefreshCw className={`w-5 h-5 ${shot.isGenerating ? 'animate-spin' : ''}`} /></button>
                      <button onClick={() => generateClipForShot(shot.id)} disabled={!shot.imageUrl} className="p-4 bg-violet-600 text-white rounded-2xl disabled:opacity-20"><Clapperboard className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="flex-1 p-10 space-y-6 relative">
                    <div className="absolute top-8 right-8 flex gap-3 text-slate-600"><button onClick={() => moveShot(idx, 'up')} disabled={idx === 0} className="hover:text-indigo-400 disabled:opacity-10"><ArrowUp /></button><button onClick={() => moveShot(idx, 'down')} disabled={idx === shots.length - 1} className="hover:text-indigo-400 disabled:opacity-10"><ArrowDown /></button><button onClick={() => setShots(shots.filter(s => s.id !== shot.id))} className="hover:text-red-500"><Trash2 /></button></div>
                    <div className="grid md:grid-cols-2 gap-6 pt-4"><div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Narrative Action</label><textarea value={shot.sceneDescription} onChange={(e) => setShots(shots.map(s => s.id === shot.id ? { ...s, sceneDescription: e.target.value } : s))} className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-sm text-slate-100 h-24 resize-none" /></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Direction</label><textarea value={shot.frameDescription} onChange={(e) => setShots(shots.map(s => s.id === shot.id ? { ...s, frameDescription: e.target.value } : s))} className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-sm text-slate-100 h-24 resize-none" /></div></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Dialogue</label><textarea value={shot.voiceText} onChange={(e) => setShots(shots.map(s => s.id === shot.id ? { ...s, voiceText: e.target.value } : s))} placeholder="Dialogue lines..." className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 text-lg text-indigo-100 h-20 resize-none font-bold" /></div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShots([...shots, { id: Math.random().toString(36).substr(2, 9), sceneDescription: '', frameDescription: '', voiceText: '', duration: 3.0, isGenerating: false, isGeneratingVideo: false }])} className="w-full py-10 border-4 border-dashed border-slate-800/50 rounded-[3rem] text-slate-700 font-black uppercase tracking-widest hover:border-indigo-500/40 transition-all flex items-center justify-center gap-4 bg-slate-900/10"><Plus /> Inject New Beat</button>
            </div>
          </section>
        )}
      </div>
      {showWebcam.active && (
        <WebcamCapture
          onCapture={handleWebcamCapture}
          onClose={() => setShowWebcam({ active: false, assetId: null })}
        />
      )}

    </div>
  );
};

export default StoryGenPage;


