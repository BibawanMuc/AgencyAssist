import { supabase } from '../config/supabase';
import { ChatSession, StoryboardSession, BotType } from '../../types';

export interface GeneratedImage {
    id?: string;
    userId?: string;
    prompt: string;
    style?: string;
    imageUrl: string;
    config?: any;
    createdAt?: number;
}

export interface GeneratedThumbnail {
    id?: string;
    userId?: string;
    prompt: string;
    platform?: string;
    imageUrl: string;
    config?: any;
    createdAt?: number;
}

export interface GeneratedVideo {
    id?: string;
    userId?: string;
    prompt: string;
    model?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    config?: any;
    createdAt?: number;
}

// ==================== CHAT SESSIONS ====================

/**
 * Save a chat session to Supabase
 */
export async function saveChatSession(session: ChatSession): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('chat_sessions')
        .upsert({
            id: session.id,
            user_id: user.id,
            title: session.title,
            bot_id: session.botId,
            messages: session.messages,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;
}

/**
 * Get all chat sessions for the current user
 */
export async function getChatSessions(): Promise<ChatSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        botId: item.bot_id as BotType,
        messages: item.messages || [],
        timestamp: new Date(item.created_at).getTime()
    }));
}

/**
 * Get a specific chat session
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return {
        id: data.id,
        title: data.title,
        botId: data.bot_id as BotType,
        messages: data.messages || [],
        timestamp: new Date(data.created_at).getTime()
    };
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) throw error;
}

/**
 * Update a chat session
 */
export async function updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updatePayload: any = {
        updated_at: new Date().toISOString()
    };

    if (updates.title) updatePayload.title = updates.title;
    if (updates.botId) updatePayload.bot_id = updates.botId;
    if (updates.messages) updatePayload.messages = updates.messages;

    const { error } = await supabase
        .from('chat_sessions')
        .update(updatePayload)
        .eq('id', sessionId);

    if (error) throw error;
}

// ==================== STORYBOARD SESSIONS ====================

/**
 * Save a storyboard session to Supabase
 */
export async function saveStoryboardSession(session: StoryboardSession): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('storyboard_sessions')
        .upsert({
            id: session.id,
            user_id: user.id,
            title: session.title,
            concept: session.concept,
            target_duration: typeof session.targetDuration === 'number' ? session.targetDuration : null,
            num_shots: typeof session.numShots === 'number' ? session.numShots : null,
            config: session.config,
            assets: session.assets,
            shots: session.shots,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;
}

/**
 * Get all storyboard sessions for the current user
 */
export async function getStoryboardSessions(): Promise<StoryboardSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('storyboard_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        concept: item.concept || '',
        targetDuration: item.target_duration || '',
        numShots: item.num_shots || '',
        config: item.config || { style: '', aspectRatio: '16:9' },
        assets: item.assets || [],
        shots: item.shots || [],
        timestamp: new Date(item.created_at).getTime()
    }));
}

/**
 * Get a specific storyboard session
 */
export async function getStoryboardSession(sessionId: string): Promise<StoryboardSession | null> {
    const { data, error } = await supabase
        .from('storyboard_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return {
        id: data.id,
        title: data.title,
        concept: data.concept || '',
        targetDuration: data.target_duration || '',
        numShots: data.num_shots || '',
        config: data.config || { style: '', aspectRatio: '16:9' },
        assets: data.assets || [],
        shots: data.shots || [],
        timestamp: new Date(data.created_at).getTime()
    };
}

/**
 * Delete a storyboard session
 */
export async function deleteStoryboardSession(sessionId: string): Promise<void> {
    const { error } = await supabase
        .from('storyboard_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) throw error;
}

/**
 * Update a storyboard session
 */
export async function updateStoryboardSession(sessionId: string, updates: Partial<StoryboardSession>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updatePayload: any = {
        updated_at: new Date().toISOString()
    };

    if (updates.title) updatePayload.title = updates.title;
    if (updates.concept) updatePayload.concept = updates.concept;
    if ('targetDuration' in updates) updatePayload.target_duration = typeof updates.targetDuration === 'number' ? updates.targetDuration : null;
    if ('numShots' in updates) updatePayload.num_shots = typeof updates.numShots === 'number' ? updates.numShots : null;
    if (updates.config) updatePayload.config = updates.config;
    if (updates.assets) updatePayload.assets = updates.assets;
    if (updates.shots) updatePayload.shots = updates.shots;

    const { error } = await supabase
        .from('storyboard_sessions')
        .update(updatePayload)
        .eq('id', sessionId);

    if (error) throw error;
}

// ==================== USER PREFERENCES ====================

interface UserPreferences {
    language: 'de' | 'en' | 'fr' | 'es';
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.auth.updateUser({
        data: {
            language: prefs.language
        }
    });

    if (error) throw error;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const language = user.user_metadata?.language;

    if (language) {
        return { language };
    }

    return null;
}
// ==================== USER PROFILES ====================

/**
 * Update user profile in profiles table
 */
/**
 * Update user profile in profiles table
 */
export async function updateUserProfile(userId: string, updates: { full_name?: string; avatar_url?: string }): Promise<void> {
    const updatePayload: any = {};
    if (updates.full_name) updatePayload.full_name = updates.full_name;
    if (updates.avatar_url) updatePayload.avatar_url = updates.avatar_url;

    const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);

    if (error) throw error;
}

// ==================== GENERATED ASSETS PERSISTENCE ====================

// --- Generated Images ---
export async function saveGeneratedImage(image: GeneratedImage): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('generated_images').insert({
        user_id: user.id,
        prompt: image.prompt,
        style: image.style,
        image_url: image.imageUrl,
        config: image.config
    });
    if (error) throw error;
}

export async function getGeneratedImages(): Promise<GeneratedImage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        prompt: item.prompt,
        style: item.style,
        imageUrl: item.image_url,
        config: item.config,
        createdAt: new Date(item.created_at).getTime()
    }));
}

// --- Generated Thumbnails ---
export async function saveGeneratedThumbnail(thumb: GeneratedThumbnail): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('generated_thumbnails').insert({
        user_id: user.id,
        prompt: thumb.prompt,
        platform: thumb.platform,
        image_url: thumb.imageUrl,
        config: thumb.config
    });
    if (error) throw error;
}

export async function getGeneratedThumbnails(): Promise<GeneratedThumbnail[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('generated_thumbnails')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        prompt: item.prompt,
        platform: item.platform,
        imageUrl: item.image_url,
        config: item.config,
        createdAt: new Date(item.created_at).getTime()
    }));
}

// --- Generated Videos ---
export async function saveGeneratedVideo(video: GeneratedVideo): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('generated_videos').insert({
        user_id: user.id,
        prompt: video.prompt,
        model: video.model,
        video_url: video.videoUrl,
        thumbnail_url: video.thumbnailUrl,
        config: video.config
    });
    if (error) throw error;
}

export async function getGeneratedVideos(): Promise<GeneratedVideo[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        prompt: item.prompt,
        model: item.model,
        videoUrl: item.video_url,
        thumbnailUrl: item.thumbnail_url,
        config: item.config,
        createdAt: new Date(item.created_at).getTime()
    }));
}
