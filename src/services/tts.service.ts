import { getApi } from "@/lib/api";
import axios from "axios";

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export const DEFAULT_VOICES: TTSVoice[] = [
  { id: "vi-VN-HoaiMyNeural", name: "Hoài My (Việt Nam - Nữ)", language: "vi-VN", gender: "Female" },
  { id: "vi-VN-NamMinhNeural", name: "Nam Minh (Việt Nam - Nam)", language: "vi-VN", gender: "Male" },
  { id: "en-US-AvaNeural", name: "Ava (English - Female)", language: "en-US", gender: "Female" },
  { id: "en-US-ChristopherNeural", name: "Christopher (English - Male)", language: "en-US", gender: "Male" },
  { id: "en-US-JennyNeural", name: "Jenny (English - Female)", language: "en-US", gender: "Female" }
];

export const getTTSVoices = async (): Promise<TTSVoice[]> => {
  return DEFAULT_VOICES;
};

export const generateTTSAudio = async (
  text: string,
  voice: string = "vi-VN-HoaiMyNeural"
): Promise<{ audio_url: string; text: string; voice: string }> => {
  const candidateUrls = [
    undefined, // Use default getApi() baseURL (https://bandoso-api.fly.dev)
    "https://bandoso-api.fly.dev/tts/generate",
    "https://bandoso-api.fly.dev/api/tts/generate",
    "http://localhost:8000/tts/generate"
  ];

  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      if (!url) {
        const api = getApi();
        const response = await api.post("/tts/generate", { text, voice }, { timeout: 20000 });
        return response.data;
      } else {
        const response = await axios.post(url, { text, voice }, { timeout: 20000 });
        return response.data;
      }
    } catch (err: any) {
      console.warn(`TTS endpoint [${url || "primary"}] failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Không thể kết nối đến máy chủ TTS");
};
