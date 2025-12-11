
export interface TrendItem {
  id: string;
  topic: string;
  category: string;
  volume: number; // Simulated mention volume
  velocity: number; // +% growth
  sentiment: 'positive' | 'negative' | 'neutral';
  platforms: string[];
  summary?: string;
  timestamp: number;
  history: number[]; // Array of historical volume points for sparkline
}

export interface ContentStrategy {
  platform: 'Twitter' | 'LinkedIn' | 'TikTok';
  hook: string;
  body: string;
  hashtags: string[];
}

export interface AnalysisResult {
  trendId: string;
  deepDive: string;
  strategies: ContentStrategy[];
  relatedLinks: { title: string; url: string }[];
  visualPrompt?: string; // AI generated prompt for image generation
  imageUrl?: string; // Base64 data of the generated image
}

export enum DataStreamStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  INGESTING = 'INGESTING',
}
