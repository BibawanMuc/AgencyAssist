
import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * Creates a fresh instance of the GoogleGenAI client.
 */
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateChatTitle = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Input content: "${message.substring(0, 500)}"`,
      config: {
        systemInstruction: "You are a specialized title generator for an AI agency. Generate EXACTLY ONE short, professional, and catchy title (3-5 words maximum) for a conversation that starts with the provided user input. Respond ONLY with the raw title text. DO NOT include any preamble, bullet points, choice lists, or formatting. No quotes around the title.",
      }
    });
    return response.text?.trim().replace(/[*"]/g, '').split('\n')[0] || "New Conversation";
  } catch (error: any) {
    console.error("Title generation failed:", error);
    return "New Conversation";
  }
};

export const createChat = (systemInstruction: string, model: string = 'gemini-3-pro-preview') => {
  const ai = getAI();
  return ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });
};

export const generateImage = async (
  prompt: string, 
  model: string = 'gemini-2.5-flash-image', 
  aspectRatio: string = "1:1",
  imageRefs?: { data: string, mimeType: string }[]
) => {
  const ai = getAI();
  
  const parts: any[] = [];
  
  if (imageRefs && imageRefs.length > 0) {
    imageRefs.forEach(ref => {
      parts.push({
        inlineData: {
          data: ref.data,
          mimeType: ref.mimeType
        }
      });
    });
  }
  
  parts.push({ text: prompt });

  const imageConfig: any = {
    aspectRatio,
  };

  if (model === 'gemini-3-pro-image-preview') {
    imageConfig.imageSize = "1K";
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (err: any) {
    if (err.message?.includes('404')) {
      throw new Error("Requested entity was not found.");
    }
    throw err;
  }
  return null;
};

export const generateVideo = async (
  prompt: string, 
  model: string = 'veo-3.1-fast-generate-preview',
  imageRef?: { data: string, mimeType: string },
  aspectRatio: '16:9' | '9:16' | '1:1' = '16:9',
  resolution: '720p' | '1080p' = '720p'
) => {
  const ai = getAI();
  
  const finalPrompt = prompt || (model.includes('fast') ? "Cinematic high-quality video" : "");
  if (!finalPrompt && !model.includes('fast')) {
    throw new Error("PRO_MODEL_REQUIRES_PROMPT");
  }

  const request: any = {
    model: model,
    config: {
      numberOfVideos: 1,
      resolution: resolution,
      aspectRatio: aspectRatio
    }
  };

  if (finalPrompt) {
    request.prompt = finalPrompt;
  }

  if (imageRef) {
    request.image = {
      imageBytes: imageRef.data,
      mimeType: imageRef.mimeType
    };
  }

  try {
    let operation = await ai.models.generateVideos(request);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("VIDEO_URI_NOT_FOUND");
    }
    
    const apiKey = process.env.API_KEY;
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`VIDEO_DOWNLOAD_FAILED: ${response.status}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
  } catch (err: any) {
    if (err.message?.includes('404')) {
      throw new Error("Requested entity was not found.");
    }
    throw err;
  }
};

export const generateShotlist = async (concept: string, assetsInfo: string, targetDuration?: number, numShots?: number): Promise<{ sceneDescription: string, frameDescription: string, voiceText: string, duration: number }[]> => {
  const ai = getAI();
  const durationInstruction = targetDuration 
    ? `The total duration of all shots combined MUST NOT exceed ${targetDuration} seconds.` 
    : `Estimate a reasonable total duration for this concept based on its complexity.`;
  
  const countInstruction = numShots 
    ? `You MUST generate EXACTLY ${numShots} shots.` 
    : `Generate a suitable number of shots (typically 4-8) to cover the narrative arc.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a professional storyboard shotlist for the following story concept: "${concept}". Relevant characters/objects: ${assetsInfo}. ${durationInstruction} ${countInstruction} Return as a clean JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sceneDescription: { type: Type.STRING },
              frameDescription: { type: Type.STRING },
              voiceText: { type: Type.STRING },
              duration: { type: Type.NUMBER }
            },
            required: ["sceneDescription", "frameDescription", "voiceText", "duration"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (err: any) {
    console.error("Failed to generate shotlist:", err);
    return [];
  }
};

export const autocompleteSingleShot = async (concept: string, assetsInfo: string, existingShots: any[], currentShotIndex: number): Promise<{ sceneDescription: string, frameDescription: string, voiceText: string, duration: number }> => {
  const ai = getAI();
  const contextBefore = existingShots.slice(0, currentShotIndex).map(s => s.sceneDescription).join(" -> ");
  const contextAfter = existingShots.slice(currentShotIndex + 1).map(s => s.sceneDescription).join(" -> ");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `We are building a storyboard for: "${concept}". Assets: ${assetsInfo}. The story flow before this shot is: [${contextBefore || 'Beginning of story'}]. The story flow after this shot is: [${contextAfter || 'End of story'}]. Generate a logical bridge shot that connects these segments seamlessly. Return as a clean JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneDescription: { type: Type.STRING },
            frameDescription: { type: Type.STRING },
            voiceText: { type: Type.STRING },
            duration: { type: Type.NUMBER }
          },
          required: ["sceneDescription", "frameDescription", "voiceText", "duration"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (err: any) {
    console.error("Shot autocomplete failed", err);
    return { sceneDescription: '', frameDescription: '', voiceText: '', duration: 3.0 };
  }
};
