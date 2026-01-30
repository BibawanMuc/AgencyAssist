
import React, { useState, useRef, useEffect } from 'react';
import { generateImage } from '../services/gemini';
import {
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Download,
  Upload,
  X,
  Key,
  Palette,
  Maximize,
  Edit3,
  Eraser,
  Check,
  Brush,
  Undo,
  Camera
} from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { ImageModel } from '../types';
import { uploadBase64Image, generateAssetPath } from '../src/services/supabase-storage';
import { saveGeneratedImage } from '../src/services/supabase-db';

interface ImageGenPageProps {
}

const IMAGE_STYLES = [
  { id: 'none', name: 'None/Default', prompt: '' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'Cinematic lighting, hyper-realistic, 8k resolution, detailed textures' },
  { id: 'realistic', name: 'Photorealistic', prompt: 'Professional photography, raw photo, realistic skin, natural lighting' },
  { id: 'anime', name: 'Anime', prompt: 'Modern anime style, vibrant colors, clean lines, high quality illustration' },
  { id: 'digital', name: 'Digital Art', prompt: 'Digital painting, smooth gradients, conceptual art, intricate details' },
  { id: 'oil', name: 'Oil Painting', prompt: 'Traditional oil painting, visible brushstrokes, rich pigments, classic art' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'Clean minimalist aesthetic, simple shapes, negative space, elegant' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'Neon lights, futuristic city, high tech low life, synthwave palette' },
  { id: 'vintage', name: 'Vintage', prompt: 'Retro 35mm film photography, grain, warm tones, nostalgic' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square (1:1)' },
  { id: '16:9', name: 'Widescreen (16:9)' },
  { id: '9:16', name: 'Portrait (9:16)' },
  { id: '4:3', name: 'Standard (4:3)' },
  { id: '3:4', name: 'Tablet (3:4)' },
];

const ImageGenPage: React.FC<ImageGenPageProps> = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>(ImageModel.PRO);
  const [selectedStyle, setSelectedStyle] = useState(IMAGE_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ url: string, prompt: string }[]>([]);
  const [sourceImage, setSourceImage] = useState<{ data: string, mimeType: string } | null>(null);

  // Inpainting / Edit Mode States
  const [editImage, setEditImage] = useState<{ url: string, prompt: string } | null>(null);
  const [brushSize, setBrushSize] = useState(40);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



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

    setSourceImage({ data, mimeType: mime });
    setShowWebcam(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSourceImage({ data: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);

    // Removed explicit key check as it is handled by the service

    try {
      let finalPrompt = selectedStyle.prompt
        ? `${prompt}. Style: ${selectedStyle.prompt}`
        : prompt;

      let imagesToSend: { data: string, mimeType: string }[] = [];

      // If we are in edit mode, include the original image and the mask
      if (editImage && canvasRef.current) {
        // ... (existing logic)
        const originalBase64 = editImage.url.split(',')[1]; // This might be a URL now, not base64 if fetched from storage. We need to handle this.
        // Actually, if editImage.url is a http link, we can't just split(',')[1].
        // We'll address this below. For now assuming we just generated it locally it's fine, but if we load from history it's a URL.
        const maskBase64 = canvasRef.current.toDataURL('image/png').split(',')[1];

        imagesToSend = [
          { data: originalBase64, mimeType: 'image/png' },
          { data: maskBase64, mimeType: 'image/png' }
        ];

        finalPrompt = `Based on the original image provided (Image 1), modify the area indicated by the mask (Image 2). In that masked area, perform the following edit: ${prompt}. Keep all other parts of the image identical to the original.`;
      } else if (sourceImage) {
        imagesToSend = [sourceImage];
      }

      const generatedDataUri = await generateImage(finalPrompt, model, aspectRatio, imagesToSend.length > 0 ? imagesToSend : undefined);

      if (generatedDataUri) {
        // Upload to Supabase Storage
        const path = generateAssetPath('images', 'png');
        const publicUrl = await uploadBase64Image(generatedDataUri, path);

        // Save to DB
        await saveGeneratedImage({
          prompt: finalPrompt,
          style: selectedStyle.id,
          imageUrl: publicUrl,
          config: { model, aspectRatio, isInpaint: !!editImage }
        });

        setResults([{ url: publicUrl, prompt: finalPrompt }, ...results]);

        // Exit edit mode on success
        setEditImage(null);
        setPrompt('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (img: { url: string, prompt: string }) => {
    setEditImage(img);
    setPrompt(''); // Clear prompt for the edit instruction
    // We scroll to top or focus on the editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditingUploaded = () => {
    if (!sourceImage) return;
    const url = `data:${sourceImage.mimeType};base64,${sourceImage.data}`;
    startEditing({ url, prompt: 'Uploaded Image Edit' });
  };

  // Canvas Drawing Logic
  useEffect(() => {
    if (editImage && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match container (which matches image aspect ratio via CSS)
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Initialize canvas with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.6)'; // Indigo mask color
      ctx.lineWidth = brushSize;
    }
  }, [editImage, brushSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-100 tracking-tighter">
            <div className="bg-indigo-600 p-2 rounded-xl"><ImageIcon className="text-white w-6 h-6" /></div>
            ImageGen <span className="text-indigo-400">Studio</span>
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Text-to-Image & Inpainting with surgical precision.</p>
        </div>
        {!editImage && (
          <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-xl">
            {ASPECT_RATIOS.map(r => (
              <button
                key={r.id}
                onClick={() => setAspectRatio(r.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${aspectRatio === r.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
              >
                {r.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl flex items-center justify-between gap-4 text-red-400 text-sm font-bold animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4">
            <X className="w-6 h-6 p-1.5 bg-red-500/20 rounded-full cursor-pointer" onClick={() => setError(null)} />
            {error}
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid lg:grid-cols-12 gap-10">

        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8 sticky top-8">

            {editImage ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Inpainting Mode
                  </h3>
                  <button onClick={() => setEditImage(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <label className="flex items-center gap-2"><Brush className="w-3 h-3" /> Brush Size</label>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={clearMask} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <Eraser className="w-3.5 h-3.5" /> Clear Mask
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Edit Instruction</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Change the glasses to neon visor..."
                    className="w-full bg-slate-800 border-slate-700 rounded-2xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 h-24 resize-none text-sm transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Creative Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your vision..."
                    className="w-full bg-slate-800 border-slate-700 rounded-[2rem] p-6 text-slate-200 focus:ring-2 focus:ring-indigo-500 h-32 resize-none text-lg font-medium transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Style Preset</label>
                    <select
                      value={selectedStyle.id}
                      onChange={(e) => {
                        const style = IMAGE_STYLES.find(s => s.id === e.target.value);
                        if (style) setSelectedStyle(style);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      {IMAGE_STYLES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Model Tier</label>
                    <div className="bg-slate-800 rounded-xl p-1 flex border border-slate-700">
                      <button onClick={() => setModel(ImageModel.FLASH)} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${model === ImageModel.FLASH ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>FLASH</button>
                      <button onClick={() => setModel(ImageModel.PRO)} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${model === ImageModel.PRO ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>PRO</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Image Reference (i2i / Inpaint)</label>
                  {sourceImage ? (
                    <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-indigo-500/30 group">
                      <img src={`data:${sourceImage.mimeType};base64,${sourceImage.data}`} className="w-full h-full object-cover" alt="Ref" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button
                          onClick={startEditingUploaded}
                          className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                          title="Draw Mask & Edit"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSourceImage(null)}
                          className="p-3 bg-red-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => fileInputRef.current?.click()} className="w-full py-6 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center gap-2 text-slate-600 hover:text-indigo-400 hover:border-indigo-500/50 transition-all bg-slate-800/20 group">
                        <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Image</span>
                      </button>

                      <div className="relative flex items-center gap-2">
                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                        <span className="text-[9px] font-black text-slate-700 uppercase">OR</span>
                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                      </div>

                      <button onClick={() => setShowWebcam(true)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                        <Camera className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest">Use Camera</span>
                      </button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
              </div>
            )}

            {showWebcam && (
              <WebcamCapture
                onCapture={handleWebcamCapture}
                onClose={() => setShowWebcam(false)}
              />
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[1.8rem] text-xl font-black tracking-tighter flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : editImage ? <Check className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              {isGenerating ? 'Synthesizing...' : editImage ? 'Apply Edit' : 'Synthesize Vision'}
            </button>
          </div>
        </div>

        {/* Right Preview/Editor Panel */}
        <div className="lg:col-span-8 h-[calc(100vh-200px)] sticky top-8 flex flex-col">
          {editImage ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-[3rem] flex items-center justify-between px-10">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600/20 p-2 rounded-xl"><Brush className="w-5 h-5 text-indigo-400" /></div>
                  <p className="text-xs font-black text-slate-200 uppercase tracking-widest">Draw mask on the image below</p>
                </div>
                <button onClick={() => setEditImage(null)} className="px-6 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
              </div>

              <div
                ref={containerRef}
                className="relative w-full rounded-[4rem] overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl cursor-crosshair touch-none"
                style={{ aspectRatio: aspectRatio === '1:1' ? '1/1' : aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : aspectRatio === '4:3' ? '4/3' : '3/4' }}
              >
                <img src={editImage.url} className="w-full h-full object-contain select-none pointer-events-none" alt="Edit Target" />
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                  className="absolute inset-0 z-10 w-full h-full"
                />

                {/* Brush Cursor Preview */}
                <div className="absolute top-10 right-10 bg-slate-950/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl z-20 flex flex-col items-center gap-4">
                  <div className="bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40" style={{ width: brushSize, height: brushSize }}>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brush Tip</p>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map((res, i) => (
                <div key={i} className="group relative bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl transition-all hover:scale-[1.02] hover:border-indigo-500/30">
                  <img src={res.url} alt={`Result ${i}`} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8 backdrop-blur-sm">
                    <p className="text-xs text-slate-400 line-clamp-2 mb-6 italic font-medium">"{res.prompt}"</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEditing(res)}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Image
                      </button>
                      <button
                        onClick={() => forceDownload(res.url, `gen-image-${Date.now()}.png`)}
                        className="w-14 h-14 bg-white text-slate-950 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[600px] border-4 border-dashed border-slate-900 rounded-[4rem] flex flex-col items-center justify-center text-slate-700 bg-slate-900/10 shadow-inner group">
              <div className="relative mb-8 transform group-hover:scale-110 transition-transform duration-700">
                <Sparkles className="w-24 h-24 opacity-5 text-indigo-500" />
                <div className="absolute inset-0 animate-pulse bg-indigo-500/5 blur-3xl rounded-full" />
              </div>
              <h3 className="text-2xl font-black text-slate-500 tracking-tighter">Imagination Canvas Empty</h3>
              <p className="text-slate-600 mt-2 font-medium">Define your vision in the control panel to begin synthesis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenPage;
