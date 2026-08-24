import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ChatMessage, ChatInput, QuickQuestionChip, TypingIndicator } from './ChatComponents';
import { 
  UsageSummaryCard, PredictionCard, RecommendationCard, 
  UsageChartCard, TimelineCard, HealthScoreCard, ReportCard 
} from './InsightComponents';
import { generateAIResponse, ChatMessageData, DashboardContext } from '../../services/geminiService';

interface CopilotViewProps {
  setActiveTab: (tab: string) => void;
}

export default function CopilotView({ setActiveTab }: CopilotViewProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "📊 Usage Analysis",
    "💡 Water Saving Tips",
    "📄 Usage Summary"
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock dashboard context - in a real app, this would come from a global state/context
  const dashboardContext: DashboardContext = {
    waterUsage: 157,
    flowRate: 16.6,
    sessions: 4,
    averageFlowRate: 12.5,
    predictedActivity: "Bathing",
    confidenceScore: 94
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMessage: ChatMessageData = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsThinking(true);

    // Call Gemini API
    const response = await generateAIResponse(text, messages, dashboardContext);
    
    const aiMessage: ChatMessageData = {
      id: Date.now() + 1,
      sender: 'ai',
      text: response.text,
      timestamp: new Date().toISOString()
    };

    setMessages([...newMessages, aiMessage]);
    setSuggestedQuestions(response.suggestedQuestions);
    setIsThinking(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto md:h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-6 shrink-0 animate-fade-up">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('Dashboard')}
            className="md:hidden p-2 rounded-full hover:bg-cardBorder transition-colors"
          >
            <ArrowLeft size={20} className="text-textMuted" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-textStrong">AquaSense Copilot</h1>
            <p className="text-textMuted text-sm">Your Intelligent Water Analysis Assistant</p>
          </div>
        </div>
      </header>

      {/* Main Layout: 2 Columns */}
      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Left Section: AI Conversation */}
        <div className="flex-1 flex flex-col bg-card/30 rounded-3xl border border-cardBorder overflow-hidden shadow-sm animate-fade-up [animation-delay:100ms] relative h-full">
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar relative">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/20 mb-4">
                    <Sparkles size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-textStrong">Hello! I'm AquaSense Copilot.</h2>
                  <p className="text-textMuted max-w-md mx-auto">
                    I can analyze your water usage, explain AI predictions, provide personalized recommendations, compare historical usage, and answer questions about your water consumption.
                  </p>
                </motion.div>
              ) : (
                messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              )}
            </AnimatePresence>
            {isThinking && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Bottom Input Area */}
          <div className="shrink-0 p-4 bg-background/80 backdrop-blur-md border-t border-cardBorder">
            {/* Quick Questions */}
            <div className="flex gap-2 overflow-x-auto pb-4 pt-1 custom-scrollbar hide-scrollbar-arrows scroll-smooth">
              {suggestedQuestions.map((q, idx) => (
                <QuickQuestionChip 
                  key={idx} 
                  text={q} 
                  onClick={(text) => handleSendMessage(text)} 
                  disabled={isThinking}
                />
              ))}
            </div>

            {/* Input Field */}
            <ChatInput 
              value={inputValue}
              onChange={setInputValue}
              onSend={() => handleSendMessage(inputValue)}
              isThinking={isThinking}
            />
          </div>
        </div>

        {/* Right Section: Live AI Insights (Sticky/Scrollable Sidebar) */}
        <div className="w-full lg:w-[350px] shrink-0 h-full overflow-y-auto custom-scrollbar pr-2 pb-10 lg:pb-0 hide-scrollbar-arrows animate-fade-up [animation-delay:200ms]">
          <UsageSummaryCard />
          <PredictionCard />
          <RecommendationCard />
          <UsageChartCard />
          <HealthScoreCard />
          <TimelineCard />
          <ReportCard />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-card-border);
          border-radius: 4px;
        }
        .hide-scrollbar-arrows::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar-arrows {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
