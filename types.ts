
export enum Page {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  THUMB_GEN = 'thumb-gen',
  STORY_GEN = 'story-gen',
  IMAGE_GEN = 'image-gen',
  VIDEO_GEN = 'video-gen'
}

export enum BotType {
  NORMAL = 'normal',
  CODING = 'coding',
  CONTENT = 'content',
  ANALYSIS = 'analysis'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  attachment?: {
    data: string;
    mimeType: string;
    name: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  botId: BotType;
  messages: ChatMessage[];
  timestamp: number;
}

export interface GeneratedContent {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

export interface StoryboardShot {
  id: string;
  sceneDescription: string;
  frameDescription: string;
  voiceText: string;
  duration: number;
  imageUrl?: string;
  videoUrl?: string;
  isGenerating?: boolean;
  isGeneratingVideo?: boolean;
}

export interface StoryboardAsset {
  id: string;
  name: string;
  type: 'character' | 'object';
  prompt?: string;
  imageUrl?: string;
  isGenerating?: boolean;
  isSelected: boolean;
}

export interface StoryboardConfig {
  style: string;
  aspectRatio: string;
}

export interface StoryboardSession {
  id: string;
  title: string;
  concept: string;
  targetDuration: number | '';
  numShots: number | '';
  assets: StoryboardAsset[];
  shots: StoryboardShot[];
  config: StoryboardConfig;
  timestamp: number;
}

export enum ImageModel {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview'
}

export enum VideoModel {
  FAST = 'veo-3.1-fast-generate-preview',
  PRO = 'veo-3.1-generate-preview'
}
