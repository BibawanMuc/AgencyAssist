import React, { useState, useRef } from 'react';
import { generateImage } from '../services/gemini';
import {
  Download,
  LayoutTemplate,
  Youtube,
  Instagram,
  Facebook,
  Tv,
  Loader2,
  Sparkles,
  Upload,
  X,
  Palette,
  UserCircle,
  Layers,
  Edit3
} from 'lucide-react';
import { ImageModel } from '../types';
import { uploadBase64Image, generateAssetPath } from '../src/services/supabase-storage';

interface ThumbGenPageProps {
}

const PLATFORMS = [
  { id: 'yt', name: 'YouTube', icon: Youtube, ratio: '16:9', promptAdd: 'YouTube thumbnail style, high contrast, catchy, bold text area' },
  { id: 'ig', name: 'Instagram', icon: Instagram, ratio: '1:1', promptAdd: 'Instagram post aesthetic, clean, stylish, high quality photography' },
  { id: 'fb', name: 'Facebook', icon: Facebook, ratio: '1:1', promptAdd: 'Facebook feed style, engaging, colorful' },
  { id: 'tt', name: 'TikTok', icon: Tv, ratio: '9:16', promptAdd: 'TikTok vertical style, high energy, vibrant' },
];

const PRESETS = {
  styles: ['Cinematic', 'Realistic', 'Anime', '3D Render', 'Minimalist', 'Pop Art', 'Cyberpunk', 'Vintage'],
  placements: ['In Front of Subject', 'Behind Subject', 'Floating Side', 'Upper Corner'],
  textStyles: ['Impact Bold', 'Neon Glow', 'Graffiti', 'Modern Serif', 'Glitch', 'Elegant Script'],
  expressions: ['Cheerful', 'Shocked', 'Serious', 'Angry', 'Confident', 'Thoughtful'],
  subjectStyles: ['Streetwear', 'Business Formal', 'Futuristic', 'Casual', 'Fantasy Armor', 'Cybernetic'],
  backgrounds: ['Studio Setup', 'Blurred City', 'Nature Landscape', 'Abstract Gradient', 'Neon Streets', 'Clean White'],
};

const ThumbGenPage: React.FC<ThumbGenPageProps> = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
  const [model, setModel] = useState<ImageModel>(ImageModel.FLASH);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Advanced Options State with Custom Input Support
  const [overallStyle, setOverallStyle] = useState(PRESETS.styles[0]);
  const [textPlacement, setTextPlacement] = useState(PRESETS.placements[0]);
  const [textStyle, setTextStyle] = useState(PRESETS.textStyles[0]);
  const [expression, setExpression] = useState(PRESETS.expressions[0]);
  const [subjectStyle, setSubjectStyle] = useState(PRESETS.subjectStyles[0]);
  const [backgroundStyle, setBackgroundStyle] = useState(PRESETS.backgrounds[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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



    try {
      const fullPrompt = `
        Professional ${selectedPlatform.name} thumbnail artwork. 
        Main Topic: ${prompt}. 
        Style: ${overallStyle}. 
        Layout: ${textPlacement}. 
        Typography: ${textStyle}. 
        Expression: ${expression}. 
        Outfit: ${subjectStyle}. 
        Background: ${backgroundStyle}. 
        ${selectedPlatform.promptAdd}. 
        
        STRICT NEGATIVE INSTRUCTION: The generated image MUST NOT contain any social media user interface elements. NO phone status bars, NO battery icons, NO Wi-Fi symbols, NO navigation buttons, NO browser chrome, NO "Like/Share" overlays, NO time displays, and NO video progress bars. Generate ONLY the static thumbnail artwork itself.
        
        High contrast, razor-sharp focus, cinematic lighting.
      `.trim();

      const imageUrl = await generateImage(fullPrompt, model, selectedPlatform.ratio, sourceImage ? [sourceImage] : undefined);

      if (imageUrl) {
        // Upload to Supabase Storage
        const path = generateAssetPath('thumbnails', 'png');
        const publicUrl = await uploadBase64Image(imageUrl, path);
        setResult(publicUrl);
      }
    } catch (err: any) {
      if (err.message?.includes('404')) {
        setError("Model not found.");
      } else {
        setError("An unexpected error occurred during generation.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `thumb-${Date.now()}.png`;
    link.click();
  };

  // Helper component for dual input (Select + Custom)
  const DualInput = ({ label, value, setter, options }: { label: string, value: string, setter: (v: string) => void, options: string[] }) => {
    const [isCustom, setIsCustom] = useState(false);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
          <button onClick={() => setIsCustom(!isCustom)} className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded transition-all ${isCustom ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}>
            {isCustom ? 'Presets' : 'Custom'}
          </button>
        </div>
        {isCustom ? (
          <div className="relative"><input type="text" value={value} onChange={(e) => setter(e.target.value)} className="w-full bg-slate-800 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 pr-8" placeholder="Type custom..." /><Edit3 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500/50" /></div>
        ) : (
          <select value={value} onChange={(e) => setter(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
            {options.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-100 tracking-tighter">
            <div className="bg-indigo-600 p-2 rounded-xl"><LayoutTemplate className="text-white w-6 h-6" /></div>
            ThumbGen <span className="text-indigo-400">Pro</span>
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Design click-worthy thumbnails with surgical AI precision.</p>
        </div>
        <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-xl">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setSelectedPlatform(p)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${selectedPlatform.id === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>
              <p.icon className="w-4 h-4" /> {p.name}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center justify-between gap-4 text-red-400 text-sm font-bold"><X className="w-5 h-5 cursor-pointer" onClick={() => setError(null)} /> {error}</div>}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8 h-fit">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Main Topic & Hooks</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A hyper-realistic review of the new Cyber-Truck..." className="w-full bg-slate-800 border-slate-700 rounded-[2rem] px-8 py-6 text-slate-100 focus:ring-4 focus:ring-indigo-500/20 h-32 resize-none transition-all text-xl font-medium outline-none shadow-inner" />

            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-5 bg-slate-800/30 p-6 rounded-[2.5rem] border border-slate-700/30">
                <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><Palette className="w-3.5 h-3.5" /> Aesthetic</h3>
                <DualInput label="Overall Style" value={overallStyle} setter={setOverallStyle} options={PRESETS.styles} />
                <DualInput label="Text Placement" value={textPlacement} setter={setTextPlacement} options={PRESETS.placements} />
                <DualInput label="Typography" value={textStyle} setter={setTextStyle} options={PRESETS.textStyles} />
              </div>
              <div className="space-y-5 bg-slate-800/30 p-6 rounded-[2.5rem] border border-slate-700/30">
                <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><UserCircle className="w-3.5 h-3.5" /> Subjects</h3>
                <DualInput label="Expression" value={expression} setter={setExpression} options={PRESETS.expressions} />
                <DualInput label="Outfit" value={subjectStyle} setter={setSubjectStyle} options={PRESETS.subjectStyles} />
                <DualInput label="Environment" value={backgroundStyle} setter={setBackgroundStyle} options={PRESETS.backgrounds} />
              </div>
            </div>

            <div className="pt-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><Layers className="w-4 h-4 text-indigo-400" /> Reference Image (i2i)</label>
              {sourceImage ? (
                <div className="relative w-full h-40 bg-slate-800 rounded-[2rem] overflow-hidden border border-indigo-500/30 group">
                  <img src={`data:${sourceImage.mimeType};base64,${sourceImage.data}`} className="w-full h-full object-cover" alt="Source" />
                  <button onClick={() => setSourceImage(null)} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-slate-700 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all bg-slate-800/20 group">
                  <Upload className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Inject Visual Reference</span>
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <div className="flex gap-6 items-center pt-6">
              <button disabled={isGenerating || !prompt} onClick={handleGenerate} className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] text-xl font-black tracking-tighter flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} {isGenerating ? 'Synthesizing...' : 'Render Pro Artwork'}
              </button>
              <div className="bg-slate-800 rounded-2xl p-1 border border-slate-700 flex shrink-0">
                <button onClick={() => setModel(ImageModel.FLASH)} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase ${model === ImageModel.FLASH ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>FAST</button>
                <button onClick={() => setModel(ImageModel.PRO)} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase relative ${model === ImageModel.PRO ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>PRO</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-200px)] sticky top-8">
          <div className="flex-1 bg-slate-900 border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center overflow-hidden relative group">
            {result ? (
              <div className="relative w-full h-full"><img src={result} alt="Generated Artwork" className="w-full h-full object-contain" /><div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4"><button onClick={downloadImage} className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-110 transition-transform"><Download className="w-4 h-4 inline mr-2" /> Download PNG</button></div></div>
            ) : (
              <div className="text-center p-12 space-y-4 opacity-20"><LayoutTemplate className="w-16 h-16 mx-auto" /><p className="text-xs font-black uppercase tracking-[0.4em]">Awaiting Synthesis</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbGenPage;