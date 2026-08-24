import { generateAIResponse, DashboardContext } from '../src/services/geminiService.ts';

// Mock import.meta.env for Node environment testing
if (!globalThis.import) {
  (globalThis as any).import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };
}

const mockContext: DashboardContext = {
  waterUsage: 150,
  flowRate: 12,
  sessions: 5,
  averageFlowRate: 10,
  predictedActivity: 'Normal',
  confidenceScore: 90
};

async function testGemini() {
  console.log("Testing Gemini API Integration...");
  try {
    const response = await generateAIResponse("Hello", [], mockContext);
    console.log("AI Response received successfully!");
    console.log("Response text:");
    console.log(response.text);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testGemini();
