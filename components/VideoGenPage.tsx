
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/gemini';
import {
  Clapperboard,
  Play,
  Info,
  ExternalLink,
  Upload,
  X,
  Key,
  Loader2,
  Type,
  Image as ImageIcon,
  Maximize2,
  Settings2,
  Sparkles,
  Square,
  Camera,
  History,
  Clock,
  Video
} from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { VideoModel } from '../types';
import { uploadFile, generateAssetPath } from '../src/services/supabase-storage';
import { saveGeneratedVideo, getGeneratedVideos, GeneratedVideo } from '../src/services/supabase-db';

interface VideoGenPageProps {
}

const ASPECT_RATIOS = [
  { id: '16:9', name: 'Landscape (16:9)', icon: Maximize2 },
  { id: '1:1', name: 'Square (1:1)', icon: Square },
  { id: '9:16', name: 'Portrait (9:16)', icon: Maximize2 },
];

const MODELS = [
  { id: VideoModel.FAST, name: 'Veo 3.1 Fast', desc: 'Faster generation, good quality' },
  { id: VideoModel.PRO, name: 'Veo 3.1 Pro', desc: 'High fidelity, cinematic quality' },
];

const VideoGenPage: React.FC<VideoGenPageProps> = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState<VideoModel>(VideoModel.FAST);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Preparing engine...');
  const [error, setError] = useState<string | null>(null);
  const [startingImage, setStartingImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getGeneratedVideos();
      setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const forceDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
      window.open(url, '_blank');
    }
  };

  const handleWebcamCapture = (base64Image: string) => {
    // base64Image comes as data:image/png;base64,...
    const parts = base64Image.split(',');
    const mime = parts[0].split(':')[1].split(';')[0];
    const data = parts[1];

    setStartingImage({ data, mimeType: mime });
    setShowWebcam(false);
  };

  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setStartingImage({ data: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // Pro model requires a prompt. Fast can use just an image.
    if (model === VideoModel.PRO && !prompt) {
      setError("The Pro model requires a descriptive text prompt.");
      return;
    }
    if (!prompt && !startingImage) return;

    setIsGenerating(true);
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setError(null);
    setStatusMessage('Connecting to Veo clusters...');

    const statusInterval = setInterval(() => {
      const messages = [
        "Analyzing cinematic composition...",
        "Rendering temporal consistency...",
        "Applying neural fluid dynamics...",
        "Refining video resolution...",
        "Synthesizing motion vectors...",
        "Director is reviewing frames...",
        "Color grading in progress...",
        "Finalizing cinematic sequence..."
      ];
      setStatusMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 7000);

    try {
      // Pro model uses 1080p for higher quality.
      const resolution = model === VideoModel.PRO ? '1080p' : '720p';
      const blobUrl = await generateVideo(prompt, model, startingImage || undefined, aspectRatio, resolution);

      if (blobUrl) {
        // Fetch the blob from the local blob URL
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // Upload to Supabase Storage
        const path = generateAssetPath('videos', 'mp4');
        const publicUrl = await uploadFile(blob, path);

        setVideoUrl(publicUrl);

        // Save to DB
        await saveGeneratedVideo({
          prompt: prompt,
          model: model,
          videoUrl: publicUrl,
          config: { aspectRatio, resolution, isI2V: !!startingImage }
        });

        // Refresh History
        await loadHistory();

        // Clean up local blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      if (err.message === 'PRO_MODEL_REQUIRES_PROMPT') {
        setError("The Pro model requires a prompt to guide the cinematic generation.");
      } else if (err.message?.includes('400')) {
        setError("Invalid API Key or arguments. Please check your settings.");
      } else if (err.message?.includes('403')) {
        setError("Permission Denied (403). Veo requires a paid API key with billing.");
      } else if (err.message?.includes('404')) {
        setError("Veo model not found. Your key might not have access to this preview.");
      } else {
        setError(`Generation failed: ${err.message || "Unknown error"}`);
      }
      setStatusMessage("Engine halted.");
    } finally {
      clearInterval(statusInterval);
      setIsGenerating(false);
    }
  };



  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {/* Sidebar History */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} flex flex-col gap-4 transition-all duration-300 shrink-0`}>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col h-full shadow-2xl">
          <div className="flex items-center justify-between px-2 mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History className="w-3 h-3" /> History
            </p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {history.map(item => (
              <div key={item.id} onClick={() => setVideoUrl(item.videoUrl)} className="group flex gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-slate-800/50 hover:border-slate-700">
                <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                  <Video className="w-6 h-6 text-slate-700" />
                  {/* No thumbnail for video yet, using icon placeholder or if we had a thumbUrl we would display it */}
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-tight">{item.prompt || 'No Prompt'}</p>
                  <div className="flex items-center gap-2 mt-1.5 opacity-50">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] text-slate-600 font-bold">{new Date(item.createdAt || 0).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-10 opacity-20">
                <History className="w-12 h-12 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No History</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-1 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-slate-400 transition-all hover:bg-slate-700 hover:text-white">
              <History className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Clapperboard className="text-indigo-500" />
                VideoGen Studio
              </h1>
              <p className="text-slate-400 mt-1">Harness Veo 3.1 for cinematic T2V and I2V creation.</p>
            </div>
          </div>
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            {MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${model === m.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {m.name.split(' ')[2]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-red-400 text-sm font-medium flex items-center gap-3">
              <X className="w-6 h-6 p-1 bg-red-500/20 rounded-full cursor-pointer" onClick={() => setError(null)} />
              {error}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-8">
              {/* Mode Indicator */}
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className={`p-3 rounded-xl ${startingImage ? 'bg-violet-600' : 'bg-indigo-600'} transition-colors`}>
                  {startingImage ? <ImageIcon className="w-5 h-5 text-white" /> : <Type className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {startingImage ? 'Image-to-Video Mode' : 'Text-to-Video Mode'}
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    {startingImage ? 'Animating uploaded frame' : 'Synthesizing from prompt'}
                  </p>
                </div>
              </div>

              {/* Prompt Area */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Cinematic Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the action, lighting, and camera movement..."
                  className="w-full bg-slate-800 border-slate-700 rounded-2xl p-6 text-slate-200 focus:ring-2 focus:ring-indigo-500 h-32 resize-none leading-relaxed text-sm transition-all"
                />
                {model === VideoModel.PRO && !prompt && (
                  <p className="text-[10px] text-amber-500 mt-2 font-medium">* Pro model requires a text prompt.</p>
                )}
              </div>

              {/* Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Starting Frame (Optional)
                </label>
                {startingImage ? (
                  <div className="relative w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden group border border-slate-700">
                    <img
                      src={`data:${startingImage.mimeType};base64,${startingImage.data}`}
                      className="w-full h-full object-cover"
                      alt="Start frame"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setStartingImage(null)}
                        className="p-3 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-8 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center gap-2 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all bg-slate-800/30 group"
                    >
                      <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                    </button>
                    <button
                      onClick={() => setShowWebcam(true)}
                      className="flex-1 py-8 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center gap-2 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all bg-slate-800/30 group"
                    >
                      <Camera className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Camera</span>
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aspect Ratio</label>
                  <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                    {ASPECT_RATIOS.map(ratio => (
                      <button
                        key={ratio.id}
                        onClick={() => setAspectRatio(ratio.id as any)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${aspectRatio === ratio.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        {ratio.id}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolution</label>
                  <div className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-2 text-indigo-400 font-bold text-center text-xs">
                    {model === VideoModel.PRO ? '1080p' : '720p'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt && !startingImage)}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 active:scale-[0.98] transition-all"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                {isGenerating ? 'Synthesizing...' : startingImage ? 'Animate with I2V' : 'Generate with T2V'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-200px)] sticky top-8">
            <div className="aspect-video bg-slate-900 border-2 border-dashed border-slate-800 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative shadow-inner">
              {isGenerating ? (
                <div className="text-center p-8 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Clapperboard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-200 mb-2">Creating Cinematic Video</h3>
                    <div className="flex items-center gap-2 justify-center">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      <p className="text-indigo-400 text-sm font-mono ml-2">{statusMessage}</p>
                    </div>
                  </div>
                </div>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover rounded-[2rem]"
                />
              ) : (
                <div className="text-center p-12 opacity-20 flex flex-col items-center">
                  <Clapperboard className="w-24 h-24 mb-6" />
                  <h3 className="text-2xl font-bold">Preview Master</h3>
                  <p className="text-sm mt-2">Ready for sequence generation.</p>
                </div>
              )}

              {/* Resolution Badge */}
              {videoUrl && !isGenerating && (
                <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  {model === VideoModel.PRO ? '1080p' : '720p'} · VEOMP4
                </div>
              )}
            </div>

            {videoUrl && (
              <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-200">Production Ready</p>
                    <p className="text-xs text-slate-500">Your high-fidelity {model === VideoModel.PRO ? 'Pro' : 'Fast'} video is synthesized.</p>
                  </div>
                </div>
                <button
                  onClick={() => forceDownload(videoUrl, `px-ai-video-${Date.now()}.mp4`)}
                  className="w-full md:w-auto px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                >
                  Download Master File
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <Settings2 className="w-4 h-4 text-slate-500" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Temporal Synthesis</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <Settings2 className="w-4 h-4 text-slate-500" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Motion Estimation</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <Settings2 className="w-4 h-4 text-slate-500" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Compositing</div>
              </div>
            </div>
          </div>
        </div>
        {showWebcam && (
          <WebcamCapture
            onCapture={handleWebcamCapture}
            onClose={() => setShowWebcam(false)}
          />
        )}
      </div>
    </div>
  );
};

export default VideoGenPage;
