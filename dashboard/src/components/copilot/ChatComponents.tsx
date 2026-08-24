import React from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Paperclip, Bot, User, Copy, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessageData } from '../../services/geminiService';

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAI = message.sender === 'ai';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
  };

  const handleRegenerate = () => {
    // UI only for now as per requirements
    console.log('Regenerate clicked for message:', message.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-6 group ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg mt-1">
          <Bot size={16} className="text-white" />
        </div>
      )}
      
      <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[85%]`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[10px] font-medium text-textMuted uppercase tracking-wider">
            {isAI ? 'AquaSense Copilot' : 'You'}
          </span>
          <span className="text-[10px] text-textMuted/50">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div 
          className={`px-5 py-4 rounded-2xl text-sm leading-relaxed prose prose-sm max-w-none ${
            isAI 
              ? 'bg-card border border-cardBorder text-text shadow-sm rounded-tl-sm prose-p:text-text prose-strong:text-textStrong prose-headings:text-textStrong prose-a:text-primary hover:prose-a:text-secondary' 
              : 'bg-primary/10 text-primary border border-primary/20 rounded-tr-sm'
          }`}
        >
          {isAI ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          ) : (
            <p className="m-0">{message.text}</p>
          )}
        </div>

        {/* Action Buttons for AI */}
        {isAI && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleCopy}
              className="p-1.5 text-textMuted hover:text-primary bg-card border border-cardBorder rounded-md transition-colors"
              title="Copy response"
            >
              <Copy size={14} />
            </button>
            <button 
              onClick={handleRegenerate}
              className="p-1.5 text-textMuted hover:text-secondary bg-card border border-cardBorder rounded-md transition-colors"
              title="Regenerate response (UI Only)"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-lg mt-1">
          <User size={16} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex gap-3 mb-6 justify-start"
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg mt-1">
      <Bot size={16} className="text-white" />
    </div>
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-[10px] font-medium text-textMuted uppercase tracking-wider">AquaSense Copilot</span>
      </div>
      <div className="bg-card border border-cardBorder px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 rounded-full bg-primary/60" />
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 rounded-full bg-primary/60" />
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary/60" />
      </div>
    </div>
  </motion.div>
);

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isThinking: boolean;
}

export const ChatInput = ({ value, onChange, onSend, isThinking }: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative mt-4">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-textMuted">
        <button className="hover:text-primary transition-colors p-1"><Paperclip size={18} /></button>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your water usage..."
        className="w-full bg-background border border-cardBorder rounded-full py-4 pl-14 pr-24 text-text placeholder:text-textMuted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
        disabled={isThinking}
      />
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button className="p-2 text-textMuted hover:text-accent transition-colors">
          <Mic size={18} />
        </button>
        <button 
          onClick={onSend}
          disabled={!value.trim() || isThinking}
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

interface QuickQuestionChipProps {
  text: string;
  onClick: (text: string) => void;
  disabled?: boolean;
}

export const QuickQuestionChip = ({ text, onClick, disabled }: QuickQuestionChipProps) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={() => onClick(text)}
      disabled={disabled}
      className="shrink-0 px-4 py-2 rounded-full bg-card border border-cardBorder text-textMuted text-xs font-medium hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {text}
    </motion.button>
  );
};
