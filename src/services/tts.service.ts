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
  try {
    const api = getApi();
    const response = await api.post("/tts/generate", { text, voice });
    return response.data;
  } catch (err) {
    console.warn("Primary TTS endpoint failed/timed out, attempting local backend http://localhost:8000/tts/generate fallback...");
    // Fallback to local server if remote URL fails or times out
    const fallbackResponse = await axios.post("http://localhost:8000/tts/generate", { text, voice }, { timeout: 15000 });
    return fallbackResponse.data;
  }
};
