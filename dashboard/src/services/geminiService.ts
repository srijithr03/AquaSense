import { askCopilot } from './api';

export interface DashboardContext {
  waterUsage: number;
  flowRate: number;
  sessions: number;
  averageFlowRate: number;
  predictedActivity: string;
  confidenceScore: number;
}

export interface ChatMessageData {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface GeminiResponse {
  text: string;
  suggestedQuestions: string[];
}

export async function generateAIResponse(
  query: string,
  chatHistory: ChatMessageData[],
  context: DashboardContext
): Promise<GeminiResponse> {
  try {
    // We send the current dashboard context as history data to the backend
    const textReply = await askCopilot(query, context);
    
    return parseGeminiResponse(textReply);
  } catch (error) {
    console.error("AI Error:", error);
    return {
      text: "I'm sorry, I couldn't process your request because the AI service is currently unavailable. Please try again later.",
      suggestedQuestions: [
        "📊 Usage Analysis",
        "💡 Water Saving Tips",
        "📄 Usage Summary"
      ]
    };
  }
}

function parseGeminiResponse(rawText: string): GeminiResponse {
  const defaultSuggestions = [
    "📊 Usage Analysis",
    "💡 Water Saving Tips",
    "📄 Usage Summary"
  ];

  if (!rawText.includes("---SUGGESTED_QUESTIONS---")) {
    return { text: rawText, suggestedQuestions: defaultSuggestions };
  }

  const [mainText, questionsPart] = rawText.split("---SUGGESTED_QUESTIONS---");
  
  const suggestions = questionsPart
    .split('\n')
    .filter(line => line.trim() && line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());

  return {
    text: mainText.trim(),
    suggestedQuestions: suggestions.length === 3 ? suggestions : defaultSuggestions
  };
}
