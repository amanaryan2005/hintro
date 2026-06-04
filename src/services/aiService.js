import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Enforce strict JSON compilation from Gemini
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING } } } }
        },
        required: ["text", "citations"]
      }
    },
    decisions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING } } } }
        },
        required: ["text", "citations"]
      }
    },
    followUpSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING } } } }
        },
        required: ["text", "citations"]
      }
    },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          assignee: { type: Type.STRING },
          citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING } } } }
        },
        required: ["task", "assignee", "citations"]
      }
    }
  },
  required: ["summary", "decisions", "followUpSuggestions", "actionItems"]
};

export const analyzeTranscriptWithGemini = async (transcriptArray) => {
  const formattedTranscript = transcriptArray
    .map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
    .join('\n');

  const prompt = `
    You are an expert, zero-hallucination meeting analysis bot.
    Analyze the following transcript and extract:
    1. Short summaries of events.
    2. Decisions made.
    3. Follow-up suggestions.
    4. Explicit action items (including who is assigned to do it).

    CRITICAL RULES:
    - Base every output strictly on the provided transcript text. Do not assume or extrapolate info.
    - If there are no clear items for a category, leave the array empty.
    - Every entry MUST map back to the exact chronological timestamp where it was discussed.
    
    Transcript:
    ${formattedTranscript}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      temperature: 0.1 // Kept low to ensure ground truth adherence
    }
  });

  return JSON.parse(response.text);
};