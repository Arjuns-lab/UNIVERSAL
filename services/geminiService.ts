import { GoogleGenAI } from "@google/genai";
import { Movie } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert movie recommendation assistant for "Universal Movies Hub".
You have access to a list of movies provided in the prompt context.
Your goal is to recommend a movie from the list based on the user's mood or query.
If the user asks for something not in the list, recommend the closest match from the list or a generic classic movie but strictly format the output.
Keep responses concise and enthusiastic.
`;

export const getMovieRecommendation = async (query: string, availableMovies: Movie[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "AI feature requires an API Key.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Create a context string of available movies
    const moviesContext = availableMovies.map(m => `- ${m.title} (${m.genres.join(', ')})`).join('\n');
    
    const prompt = `
    Here is our catalog:
    ${moviesContext}

    User Query: "${query}"

    Recommend one movie from the catalog if possible. 
    Explain why in 2 sentences.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I couldn't find a perfect match, but 'Interstellar Horizons' is trending!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the movie brain right now.";
  }
};