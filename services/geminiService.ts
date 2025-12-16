
import { GoogleGenAI } from "@google/genai";
import { TrendItem, AnalysisResult, TrendReportItem } from "../types";
import { SocialSignal } from "./tikHubService";
import { KEYWORD_DICTIONARY_PROMPT } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const checkApiKey = () => !!apiKey;

/**
 * ROBUST JSON PARSER
 * Uses bracket counting to handle cases where LLMs add trailing text 
 * (e.g. "Here is the JSON: ... Hope this helps!")
 */
const cleanAndParseJSON = (text: string, defaultValue: any) => {
    try {
        // 1. Remove Markdown wrappers
        let clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

        // 2. Locate the start of the JSON structure
        const firstBrace = clean.indexOf('{');
        const firstBracket = clean.indexOf('[');
        
        let startIdx = -1;
        let openChar = '';
        let closeChar = '';

        // Determine if we are looking for an Object {} or Array []
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIdx = firstBrace;
            openChar = '{';
            closeChar = '}';
        } else if (firstBracket !== -1) {
            startIdx = firstBracket;
            openChar = '[';
            closeChar = ']';
        } else {
            // No JSON structure found
            return defaultValue;
        }

        // 3. Robust Balance Counting to find the TRUE end
        // This avoids issues where the model adds commentary after the JSON
        let balance = 0;
        let endIdx = -1;
        let insideString = false;
        let escape = false;

        for (let i = startIdx; i < clean.length; i++) {
            const char = clean[i];

            if (escape) {
                escape = false;
                continue;
            }
            if (char === '\\') {
                escape = true;
                continue;
            }
            if (char === '"') {
                insideString = !insideString;
                continue;
            }

            if (!insideString) {
                if (char === openChar) {
                    balance++;
                } else if (char === closeChar) {
                    balance--;
                    if (balance === 0) {
                        endIdx = i;
                        break;
                    }
                }
            }
        }

        if (endIdx !== -1) {
            const jsonStr = clean.substring(startIdx, endIdx + 1);
            return JSON.parse(jsonStr);
        }
        
        // Fallback: If balancing failed (e.g. malformed JSON), try the naive approach
        const lastIdx = clean.lastIndexOf(closeChar);
        if (lastIdx !== -1) {
             return JSON.parse(clean.substring(startIdx, lastIdx + 1));
        }

        return defaultValue;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return defaultValue;
    }
}

/**
 * AUTO-COMPLETE: Fast suggestions using Flash-Lite
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    if (!apiKey || !query.trim() || query.length < 2) return [];
    
    // Using Flash-Lite for lowest latency as requested
    const model = "gemini-2.5-flash-lite"; 

    const prompt = `
        You are an AI Search Assistant for a Visual Trend Platform.
        
        REFERENCE DICTIONARY:
        ${KEYWORD_DICTIONARY_PROMPT}

        User input: "${query}"
        
        Task: Suggest 5 specific, high-intent search queries strictly related to VISUAL TRENDS (Portrait styles, Cosplay characters, Filters, AI Tools, Video effects).
        
        Rules:
        1. Ignore generic news or politics. Focus on Aesthetics/Visuals/Creators.
        2. Use the Reference Dictionary vocabulary (e.g., "cyberpunk", "arcane style", "claymation", "outpainting").
        3. If the input is broad (e.g. "style"), suggest specific dictionary categories (e.g. "Y2K aesthetics", "Ukiyo-e style").
        
        Return ONLY a raw JSON array of strings. 
        Example: ["cyberpunk portrait lighting", "arcane jinx cosplay", "claymation filter tutorial"]
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                temperature: 0.3 // Lower temperature for more deterministic/focused completions
            }
        });

        const data = cleanAndParseJSON(response.text || "[]", []);
        return Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (error) {
        console.warn("Auto-complete failed", error);
        return [];
    }
};

/**
 * ACTIVE SCAN: Searches for real trends based on user input.
 */
export const searchGlobalTrends = async (query: string): Promise<TrendItem[]> => {
  if (!apiKey) throw new Error("API Key Missing");

  // Using Standard Flash for reasoning + tool use
  const model = "gemini-2.5-flash"; 
  
  const prompt = `
    Conduct a broad "Global Trend Scan" for: "${query}".
    
    CRITICAL CONSTRAINT: Focus strictly on VISUAL, ENTERTAINMENT, and VIDEO content.
    Prioritize trends that involve: Images, Short Videos (TikTok/Reels), Filters, Cosplay, Aesthetics, or Pop Culture Visuals.
    Avoid dry text news or politics unless it has a strong visual meme component.

    1. Find 10-15 DISTINCT, REAL-TIME trending stories/events happening RIGHT NOW.
    2. Mix categories: Visual Arts, Pop Culture, Viral Memes, Fashion, AI Video Tools.
    3. CRITICAL: Identify the primary social platform for each (TikTok, Instagram, YouTube, X).
    4. Provide a "Trend Score" (0-100) based on perceived virality.
    
    Output JSON Array format (Strict):
    [
      {
        "topic": "Headline",
        "category": "Filter|Cosplay|Portrait|Video|Meme",
        "volume": 50000,
        "velocity": 80,
        "sentiment": "positive|neutral|negative",
        "platforms": ["TikTok", "Instagram"],
        "summary": "Brief context focusing on the visual/video aspect...",
        "trendScore": 90,
        "riskLevel": "low|medium|high",
        "evidence": [
             { "source": "Web", "snippet": "..." }
        ]
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
          tools: [{ googleSearch: {} }] // Enforcing Google Search Grounding
      },
    });

    const data = cleanAndParseJSON(response.text || "[]", []);
    
    if (!Array.isArray(data)) return [];

    return data.map((item: any, index: number) => ({
      ...item,
      id: `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Random ID to prevent collisions on append
      timestamp: Date.now(),
      agentReady: (item.trendScore || 0) > 70,
      agentType: item.category === 'Tech' ? 'tool' : (item.category === 'Meme' ? 'filter' : 'portrait'),
      history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 100))
    }));

  } catch (error) {
    console.error("Scan Error:", error);
    return [];
  }
};

/**
 * DEEP ANALYSIS: Generates the Dashboard Report with DICTIONARY GUIDANCE
 */
export const analyzeDeepDive = async (trend: TrendItem): Promise<AnalysisResult> => {
    if (!apiKey) throw new Error("API Key Missing");
    const model = "gemini-2.5-flash"; 
    
    const prompt = `
      You are an expert Social Media Strategist.
      
      Trend to Analyze: "${trend.topic}"
      Context: ${trend.summary}

      ${KEYWORD_DICTIONARY_PROMPT}

      TASK:
      1. Consult the REFERENCE KEYWORD DICTIONARY above.
      2. Find the BEST MATCH category and keyword for this trend.
      3. Create a comprehensive "Creator Guideline" JSON object. 
         IMPORTANT: The 'guideline' object MUST be populated. Do not leave it empty.

      OUTPUT JSON SCHEMA:
      {
        "deepDive": "2-3 sentences analyzing why this is trending and the psychological hook.",
        "marketFit": "Specific target audience demographics (age, interest, location).",
        "guideline": {
            "matchedCategory": "Copy exact category name from Dictionary (e.g. '1.1 Style-driven Portrait')",
            "coreKeyword": "Copy exact keyword from Dictionary (e.g. 'cyberpunk portrait')",
            "productionSteps": [
                "Step 1: Detailed instruction...", 
                "Step 2: Detailed instruction...", 
                "Step 3: ...", 
                "Step 4: ..."
            ],
            "recommendedTools": ["Tool Name 1", "Tool Name 2"],
            "commercialPotential": "Low|Medium|High"
        },
        "visualPrompt": "A highly detailed, photorealistic AI image prompt to generate a perfect example of this trend. Mention lighting, camera angle, and style.",
        "scores": {
            "monetization": 0-100,
            "virality": 0-100,
            "feasibility": 0-100,
            "competition": 0-100
        },
        "strategies": [
          { "platform": "TikTok", "hook": "Visual hook description...", "body": "Caption idea...", "hashtags": ["tag1", "tag2"] },
          { "platform": "Instagram", "hook": "Visual hook description...", "body": "Caption idea...", "hashtags": ["tag1", "tag2"] }
        ]
      }
    `;
  
    try {
      // Retry Logic: Try with Tools first, fallback to basic generation if tools fail (500 error)
      let response;
      try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }] 
            },
          });
      } catch (toolError) {
          console.warn("Analysis with Google Search failed, retrying without tools...", toolError);
          response = await ai.models.generateContent({
              model,
              contents: prompt,
              config: { 
                  responseMimeType: "application/json"
              },
          });
      }
  
      const data = cleanAndParseJSON(response.text || "{}", {});
      
      let relatedLinks: { title: string; url: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
          chunks.forEach((chunk: any) => {
              if (chunk.web?.uri) {
                  relatedLinks.push({ title: chunk.web.title || "Source", url: chunk.web.uri });
              }
          });
      }
      
      // Robust Guideline Construction
      // We ensure nested arrays exist even if AI returns a partial object
      const rawGuideline = data.guideline || {};
      const safeGuideline = {
          matchedCategory: rawGuideline.matchedCategory || "General Trend",
          coreKeyword: rawGuideline.coreKeyword || trend.topic,
          productionSteps: Array.isArray(rawGuideline.productionSteps) ? rawGuideline.productionSteps : ["Research the topic", "Create engaging visual", "Post with trending audio"],
          recommendedTools: Array.isArray(rawGuideline.recommendedTools) ? rawGuideline.recommendedTools : ["Camera", "Editing App"],
          commercialPotential: rawGuideline.commercialPotential || "Medium"
      };
  
      return {
        trendId: trend.id,
        deepDive: data.deepDive || "Analysis pending...",
        marketFit: data.marketFit || "General Audience",
        strategies: Array.isArray(data.strategies) ? data.strategies : [], // Ensure Array
        visualPrompt: data.visualPrompt || `A highly detailed, photorealistic AI image prompt to generate a perfect example of this trend. Mention lighting, camera angle, and style.`,
        scores: data.scores || { monetization: 50, virality: 50, feasibility: 50, competition: 50 },
        relatedLinks,
        guideline: safeGuideline
      };
  
    } catch (error) {
      console.error("Analysis Error:", error);
      throw error;
    }
  };

/**
 * GENERATE IMAGE: Using gemini-3-pro-image-preview
 */
export const generateTrendImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
    if (!apiKey) throw new Error("API Key not found");
    const primaryModel = "gemini-3-pro-image-preview";
    
    try {
        const response = await ai.models.generateContent({
            model: primaryModel,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "1:1", 
                    imageSize: size
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
    } catch (error) {
        console.warn("[ImageGen] Primary model failed, attempting fallback...", error);
    }

    try {
        const fallbackModel = "gemini-2.5-flash-image";
        const response = await ai.models.generateContent({
            model: fallbackModel,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "1:1" }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
    } catch (fallbackError) {
        console.error("[ImageGen] All models failed", fallbackError);
    }

    return null;
};

/**
 * AGENT: Process Social Signals
 */
export const runGrowthAnalyticsAgent = async (signals: SocialSignal[]): Promise<TrendReportItem[]> => {
    if (!apiKey) throw new Error("API Key Missing");
    const model = "gemini-2.5-flash";
    
    if (!signals || signals.length === 0) return [];

    const signalsJson = JSON.stringify(signals);
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
    You are an expert Growth Analytics + Social Trend Intelligence agent.
    Current Date: ${today}
    Input Signals: ${signalsJson}
    Task: Transform signals into dashboard JSON.
    Output JSON Array (TrendReportItem schema).
    Ensure each item has 'metrics', 'scores', 'risks', 'build_plan' objects populated.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" },
        });
        
        const parsed = cleanAndParseJSON(response.text || "[]", []);
        if (!Array.isArray(parsed)) return [];
        
        // Filter out nulls/primitives to prevent crash on property access (e.g. metrics.search_index)
        return parsed
            .filter((item: any) => item && typeof item === 'object')
            .map((item: any) => ({
                date: item.date || today,
                window_hours: item.window_hours || 24,
                platform: item.platform || 'Unknown',
                keyword: item.keyword || 'Unknown Trend',
                category: item.category || 'General',
                metrics: {
                    search_index: item.metrics?.search_index || 0,
                    views: item.metrics?.views || 0,
                    likes: item.metrics?.likes || 0,
                    comments: item.metrics?.comments || 0,
                    shares: item.metrics?.shares || 0,
                    saves: item.metrics?.saves || 0,
                    posts: item.metrics?.posts || 0,
                    prev_views: item.metrics?.prev_views || 0,
                    prev_likes: item.metrics?.prev_likes || 0,
                    prev_comments: item.metrics?.prev_comments || 0,
                    prev_shares: item.metrics?.prev_shares || 0,
                    prev_saves: item.metrics?.prev_saves || 0,
                    prev_posts: item.metrics?.prev_posts || 0,
                },
                scores: {
                    H: item.scores?.H || 0,
                    V: item.scores?.V || 0,
                    D: item.scores?.D || 0,
                    F: item.scores?.F || 0,
                    M: item.scores?.M || 0,
                    R: item.scores?.R || 0,
                    trend_score: item.scores?.trend_score || 0,
                },
                lifecycle: item.lifecycle || 'emerging',
                agent_ready: item.agent_ready || false,
                build_plan: {
                    recommended: item.build_plan?.recommended || false,
                    agent_type: item.build_plan?.agent_type || 'Custom',
                    model_stack: item.build_plan?.model_stack || [],
                    interaction: item.build_plan?.interaction || '',
                    expected_time_to_ship_days: item.build_plan?.expected_time_to_ship_days || 0,
                },
                go_to_market: {
                    primary_platform: item.go_to_market?.primary_platform || 'Generic',
                    content_format: item.go_to_market?.content_format || 'Post',
                    hook_examples: item.go_to_market?.hook_examples || [],
                    creator_fit: item.go_to_market?.creator_fit || 'General',
                },
                risks: {
                    ip_risk: item.risks?.ip_risk || 'low',
                    saturation_risk: item.risks?.saturation_risk || 'low',
                    notes: item.risks?.notes || 'No notes',
                },
                assumptions: item.assumptions || [],
                author: `Analyst_Agent_${Math.floor(Math.random() * 900) + 100}`,
                sample_content: item.sample_content || item.risks?.notes || `Detected significant signal for ${item.keyword || 'trend'} on ${item.platform || 'social'}.`
            }));
    } catch (error) {
        console.error("Growth Agent Error:", error);
        return [];
    }
};
