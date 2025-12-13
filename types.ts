
export interface TrendItem {
  id: string;
  topic: string;
  category: string;
  volume: number;
  velocity: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  platforms: string[];
  summary?: string;
  timestamp: number;
  history: number[];
  
  // Scoring & Meta
  trendScore?: number;
  agentReady?: boolean;
  agentType?: 'portrait' | 'filter' | 'tool' | 'video' | 'other';
  riskLevel?: 'low' | 'medium' | 'high';
  saturation?: 'low' | 'medium' | 'high';

  // Real Evidence (Grounding)
  evidence?: {
      source: string;
      snippet: string;
      url?: string;
      publishedTime?: string;
  }[];
}

export interface ContentStrategy {
  platform: 'Twitter' | 'LinkedIn' | 'TikTok' | 'Generic';
  hook: string;
  body: string;
  hashtags: string[];
}

export interface CreatorGuideline {
    matchedCategory: string; // e.g., "1.1 Style-driven Portrait"
    coreKeyword: string; // e.g., "cyberpunk portrait"
    productionSteps: string[]; // Step by step how to make it
    recommendedTools: string[]; // e.g., "Midjourney v6", "Flux"
    commercialPotential: 'Low' | 'Medium' | 'High';
}

export interface AnalysisResult {
  trendId: string;
  deepDive: string; 
  marketFit: string; 
  strategies: ContentStrategy[];
  relatedLinks: { title: string; url: string }[];
  visualPrompt?: string; 
  imageUrl?: string;
  
  // New: Dictionary Integration
  guideline?: CreatorGuideline;
  
  // Radar Metrics (0-100)
  scores: {
      monetization: number;
      virality: number;
      feasibility: number;
      competition: number; 
  }
}

export enum DataStreamStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
  INGESTING = 'INGESTING'
}

export interface TrendReportItem {
    date: string;
    window_hours: number;
    platform: string;
    keyword: string;
    category: string;
    metrics: {
        search_index: number;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        posts: number;
        prev_views: number;
        prev_likes: number;
        prev_comments: number;
        prev_shares: number;
        prev_saves: number;
        prev_posts: number;
    };
    scores: {
        H: number;
        V: number;
        D: number;
        F: number;
        M: number;
        R: number;
        trend_score: number;
    };
    lifecycle: string;
    agent_ready: boolean;
    build_plan: {
        recommended: boolean;
        agent_type: string;
        model_stack: string[];
        interaction: string;
        expected_time_to_ship_days: number;
    };
    go_to_market: {
        primary_platform: string;
        content_format: string;
        hook_examples: string[];
        creator_fit: string;
    };
    risks: {
        ip_risk: string;
        saturation_risk: string;
        notes: string;
    };
    assumptions: string[];
    author?: string;
    sample_content?: string;
}
