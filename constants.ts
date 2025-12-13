
import { TrendItem } from './types';

export const APP_NAME = "TrendPulse AI";

export const CATEGORIES = [
  "Tech & AI",
  "Crypto & Web3",
  "Marketing",
  "YouTube",
  "LinkedIn",
  "Pop Culture",
  "Global News"
];

// The "Dictionary" of keywords provided by the user to guide content creation
export const KEYWORD_DICTIONARY_PROMPT = `
REFERENCE KEYWORD DICTIONARY (Use this to classify trends and suggest content):

1. Portrait (High Conversion)
1.1 Style-driven: leaf style, floral style, oil painting, watercolor, cyberpunk, vaporwave, noir, renaissance, baroque, ukiyo-e, studio lighting, cinematic, retro 90s, y2k, polaroid.
1.2 Use-case: business portrait, corporate headshot, linkedin, cv photo, passport photo, dating profile, tinder, instagram profile, magazine cover, model comp card.
1.3 Identity: MBTI vibe, zodiac sign, enneagram, aesthetic personality, aura color, spirit animal.
1.4 Appearance: hair changer, hairstyle simulator, hair color, beard, makeup transfer, skin tone, face symmetry.

2. Cosplay (IP Driven)
2.1 Anime/Game: arcane, zootopia, Demon Slayer, Naruto, One Piece, Solo Leveling, Genshin Impact, Honkai Star Rail, LoL, Overwatch.
2.2 Movie/Western: Harry Potter, LOTR, Star Wars, Marvel, DC, Stranger Things, The Boys, Avatar.
2.3 Costume: princess dress, royal costume, fantasy armor, medieval, cyber armor, Jabaro, ai costume designer.

3. Filter (Viral Social)
3.1 Anime: arcane filter, One Piece filter, NARUTO filter, Ghibli style, etc.
3.2 IP: Harry Potter, Marvel, ironman, spiderman, venom, etc.
3.3 Meme/Trend: labubu, disney style, lego, stitch, barbie, squid game, minion, pixar style, claymation.

4. Tools (Utility)
4.1 Edit: remover, expander, outpainting, upscaler, face enhancer.
4.2 Nostalgia: old photo restoration, colorization, childhood photo.
4.3 Production: thumbnail maker, cover generator, meme generator, caption generator.
4.4 Life Stage: baby face predictor, future baby, wedding photo, couple portrait.

5. Fashion (Virtual Try-on)
Keywords: ai virtual fitting, clothes changer, outfit generator, streetwear, luxury, runway, ootd, ai stylist.

6. Video (New Tech)
Keywords: sora, video avatar, talking photo, image to video, anime video, cinematic short, tiktok video ai.

7. Emotional/Social
Keywords: glow up, ugly to pretty, before after, confidence booster, dream version of me, who will I be in 10 years.
`;

const RAW_TRENDS: Omit<TrendItem, 'history'>[] = [
  // --- TECH & AI ---
  {
    id: 't1',
    topic: 'Gemini 2.5 Flash Release',
    category: 'Tech & AI',
    volume: 12500,
    velocity: 124,
    sentiment: 'positive',
    platforms: ['Twitter', 'HackerNews'],
    timestamp: Date.now(),
    summary: 'Google releases Gemini 2.5 Flash with sub-millisecond latency and enhanced reasoning.',
    trendScore: 92,
    agentReady: true,
    agentType: 'tool',
    riskLevel: 'low',
    saturation: 'medium'
  },
  // ... (Other initial items can be kept or cleared, app loads real data anyway)
];

export const INITIAL_TRENDS: TrendItem[] = []; 
