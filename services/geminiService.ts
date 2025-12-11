
import { GoogleGenAI } from "@google/genai";
import { TrendItem, AnalysisResult } from "../types";

// NOTE: In a real production app, this key should be proxy-served. 
// For this hackathon demo, we rely on process.env.API_KEY injected by the runtime.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const checkApiKey = () => {
    return !!apiKey;
};

// Helper to clean JSON from markdown code blocks
const cleanAndParseJSON = (text: string, defaultValue: any) => {
    try {
        // 1. Try to extract from markdown code blocks first
        const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/i);
        if (jsonBlock) {
            return JSON.parse(jsonBlock[1]);
        }

        const genericBlock = text.match(/```\s*([\s\S]*?)\s*```/);
        if (genericBlock) {
             return JSON.parse(genericBlock[1]);
        }

        // 2. Try parsing the raw text directly
        return JSON.parse(text);
    } catch (e) {
        // 3. Last resort: Try to find array/object boundaries
        try {
            const startArray = text.indexOf('[');
            const endArray = text.lastIndexOf(']');
            if (startArray !== -1 && endArray !== -1 && endArray > startArray) {
                return JSON.parse(text.substring(startArray, endArray + 1));
            }
            
            const startObj = text.indexOf('{');
            const endObj = text.lastIndexOf('}');
            if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
                return JSON.parse(text.substring(startObj, endObj + 1));
            }
        } catch (e2) {
             console.error("JSON Parse Error:", e, "Raw Text:", text);
        }
        
        return defaultValue;
    }
}

/**
 * Uses Gemini 2.5 Flash with Google Search Grounding to find REAL trending topics.
 * Simulates a "Kafka Consumer" by batching these results.
 */
export const fetchLiveTrends = async (category: string): Promise<TrendItem[]> => {
  if (!apiKey) throw new Error("API Key not found");

  // Switched to gemini-2.5-flash for better stability with Google Search tool
  const model = "gemini-2.5-flash"; 
  
  // Updated prompt to enforce JSON structure and diversity across platforms
  const prompt = `
    Find 10-15 distinct, currently trending specific topics in the category: "${category}".
    
    You MUST look for trends across these specific platforms: Twitter (X), TikTok, LinkedIn, Reddit, and Instagram.
    Do not just give generic news; give specific viral conversations, hashtags, or debates happening NOW.
    
    For each trend:
    1. Estimate a "hype score" (volume) between 2000-50000.
    2. Estimate growth percentage (velocity).
    3. Determine sentiment (positive, negative, neutral).
    4. Explicitly list the SOURCE platforms where this is trending (e.g. ["TikTok", "Instagram"]).
    5. Provide a 1-sentence summary.
    
    IMPORTANT: Return ONLY a valid JSON array. Do not include any other text or markdown formatting.
    Example format:
    [
      {
        "topic": "string",
        "volume": 1234,
        "velocity": 12,
        "sentiment": "positive",
        "platforms": ["TikTok", "Instagram"],
        "summary": "string"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // ENABLE GROUNDING for real-time data
        // CRITICAL FIX: responseMimeType and responseSchema are NOT supported when using tools/search.
        // We rely on the prompt to return JSON.
      },
    });

    const text = response.text || "[]";
    const data = cleanAndParseJSON(text, []);
    
    if (!Array.isArray(data)) return [];

    // Enrich with IDs, timestamps, and sparkline history
    return data.map((item: any, index: number) => ({
      ...item,
      id: `${category}-${Date.now()}-${index}`,
      category,
      timestamp: Date.now(),
      platforms: Array.isArray(item.platforms) ? item.platforms : ['Web'], // Data sanitization
      // Generate synthetic history data for the sparkline
      history: Array.from({ length: 20 }, () => {
         const vol = item.volume || 5000;
         return Math.max(100, Math.floor(vol * (0.8 + Math.random() * 0.4)));
      })
    }));

  } catch (error) {
    console.error("Gemini Live Trend Fetch Error:", error);
    return [];
  }
};

/**
 * deep analyzes a specific trend to generate content strategy.
 */
export const analyzeTrendStrategy = async (trend: TrendItem): Promise<AnalysisResult> => {
    if (!apiKey) throw new Error("API Key not found");

    const model = "gemini-2.5-flash"; 
    
    const prompt = `
      Act as a world-class Social Media Strategist.
      Analyze this trend: "${trend.topic}" (${trend.summary}).
      
      1. Provide a "Deep Dive" paragraph explaining WHY this is trending now.
      2. Create specific content strategies for Twitter, LinkedIn, and TikTok to capitalize on this trend.
      3. Create a highly descriptive, artistic "Visual Prompt" that could be used with an AI image generator (like Midjourney or Gemini Image) to create a viral thumbnail or header image for this trend. Describe lighting, style, and key elements.
      
      IMPORTANT: Return ONLY a valid JSON object. Do not include any other text or markdown formatting.
      Example format:
      {
        "deepDive": "string",
        "visualPrompt": "string",
        "strategies": [
          { "platform": "Twitter", "hook": "string", "body": "string", "hashtags": ["tag1"] }
        ]
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], // Grounding to get latest context
          // CRITICAL FIX: responseMimeType cannot be used here.
        },
      });
  
      const text = response.text || "{}";
      const data = cleanAndParseJSON(text, { deepDive: "Analysis unavailable.", strategies: [], visualPrompt: "" });
      
      // Extract grounding metadata if available (URLs)
      let relatedLinks: { title: string; url: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
          chunks.forEach((chunk: any) => {
              if (chunk.web?.uri) {
                  relatedLinks.push({ title: chunk.web.title || "Source", url: chunk.web.uri });
              }
          });
      }
  
      // Data Sanitization
      const strategies = Array.isArray(data.strategies) ? data.strategies.map((s: any) => ({
          ...s,
          hashtags: Array.isArray(s.hashtags) ? s.hashtags : []
      })) : [];

      return {
        trendId: trend.id,
        deepDive: data.deepDive || "Analysis unavailable",
        strategies: strategies,
        visualPrompt: data.visualPrompt || `A futuristic digital art representation of ${trend.topic}, neon colors, trending on artstation`,
        relatedLinks
      };
  
    } catch (error) {
      console.error("Gemini Strategy Error:", error);
      throw error;
    }
  };

/**
 * Generates an image for the trend using Gemini 2.5 Flash Image (Nano Banana)
 */
export const generateTrendImage = async (prompt: string): Promise<string | null> => {
    if (!apiKey) throw new Error("API Key not found");

    // Use gemini-2.5-flash-image for efficient image generation
    const model = "gemini-2.5-flash-image";

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] }
        });

        // Search for image part in response
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Gemini Image Generation Error:", error);
        return null;
    }
};
