import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ChevronLeft, Send, Sparkles, User, Bot, Heart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIAgent } from '../types';

interface FloatingChatWidgetProps {
  agents: AIAgent[];
}

export default function FloatingChatWidget({ agents = [] }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [chatHistory, setChatHistory] = useState<{[agentId: string]: {role: 'user' | 'assistant' | 'system', content: string}[]}>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, selectedAgent, isLoading]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent || isLoading) return;

    const userMsg = input.trim();
    setInput('');

    const currentAgentId = selectedAgent.id;
    const currentSession = chatHistory[currentAgentId] || [];

    // Add user message to history
    const updatedSession = [...currentSession, { role: 'user' as const, content: userMsg }];
    setChatHistory(prev => ({
      ...prev,
      [currentAgentId]: updatedSession
    }));

    setIsLoading(true);

    try {
      // Build messages payload for API
      const apiMessages = [
        { 
          role: 'system', 
          content: selectedAgent.systemPrompt || `You are ${selectedAgent.name}, an expert AI assistant. Personality: ${selectedAgent.personality}` 
        },
        ...updatedSession.map(msg => ({ role: msg.role, content: msg.content }))
      ];

      // Call medical-chat proxy endpoint
      const response = await fetch('/api/medical-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'No response received from agent.';

      setChatHistory(prev => ({
        ...prev,
        [currentAgentId]: [...updatedSession, { role: 'assistant' as const, content: reply }]
      }));
    } catch (err: any) {
      console.error('Error in chat widget API:', err);
      // Friendly fallback/error bubble
      const errMsg = `[System Message: Note that to enable real-time replies, make sure your OpenAI API key is configured in settings.]\n\nFallback Simulation: I am trained as "${selectedAgent.personality}". I received your message: "${userMsg}". How can I help you further?`;
      setChatHistory(prev => ({
        ...prev,
        [currentAgentId]: [...updatedSession, { role: 'assistant' as const, content: errMsg }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Get current active session messages
  const activeSession = selectedAgent ? (chatHistory[selectedAgent.id] || []) : [];

  // When an agent is selected, initialize with their greeting if empty
  const selectAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    if (!chatHistory[agent.id] || chatHistory[agent.id].length === 0) {
      setChatHistory(prev => ({
        ...prev,
        [agent.id]: [{
          role: 'assistant',
          content: agent.greetingMessage || `Hello! I am ${agent.name}. How can I assist you today?`
        }]
      }));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-white">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-20 right-0 w-[380px] sm:w-[420px] h-[550px] bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {selectedAgent && (
                  <button 
                    onClick={() => setSelectedAgent(null)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-[#94A3B8] hover:text-white"
                    title="Back to Agent List"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#2563eb]/20 flex items-center justify-center border border-[#2563eb]/30 shadow-md">
                    {selectedAgent ? <Bot className="w-4.5 h-4.5 text-[#2563eb]" /> : <Heart className="w-4.5 h-4.5 text-[#2563eb]" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                      {selectedAgent ? selectedAgent.name : 'Clinic AI Support'}
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <p className="text-[10px] text-[#94A3B8]">
                      {selectedAgent ? (selectedAgent.voice || 'Clinical Specialist') : 'Select an AI specialist to chat'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#0B0F19]">
              {!selectedAgent ? (
                /* SCREEN 1: LIST ALL AGENTS */
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                  <div className="mb-2 text-center py-2">
                    <p className="text-xs text-[#94A3B8] font-medium max-w-xs mx-auto">
                      Welcome to our medical clinic assistance desk. Please choose one of our AI receptionists or physicians below to begin chatting:
                    </p>
                  </div>

                  <div className="space-y-3">
                    {agents && agents.length > 0 ? (
                      agents.map((agt) => (
                        <button
                          key={agt.id}
                          onClick={() => selectAgent(agt)}
                          className="w-full text-left p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-[#2563eb]/40 transition-all duration-300 flex items-start gap-3.5 group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#2563eb]/10 group-hover:bg-[#2563eb]/20 flex items-center justify-center border border-[#2563eb]/20 transition-colors shrink-0">
                            <Bot className="w-5 h-5 text-[#2563eb]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white group-hover:text-[#2563eb] transition-colors">
                                {agt.name}
                              </span>
                              <span className="text-[9px] bg-[#2563eb]/10 text-[#2563eb] px-1.5 py-0.5 rounded-full font-mono uppercase">
                                Active
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {agt.personality || 'Empathetic and professional assistant.'}
                            </p>
                            <p className="text-[9px] text-[#94A3B8] mt-1.5 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-[#2563eb]" /> Voice: {agt.voice}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-xs text-slate-500">No active agents configured.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* SCREEN 2: ACTIVE CHAT WITH AGENT */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {activeSession.map((msg, idx) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div key={idx} className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                          <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-[10px] ${
                            isUser ? 'bg-[#2563eb]/20 border-[#2563eb]/30' : 'bg-slate-800 border-slate-700'
                          }`}>
                            {isUser ? <User className="w-3.5 h-3.5 text-[#2563eb]" /> : <Bot className="w-3.5 h-3.5 text-slate-300" />}
                          </div>
                          <div className="flex flex-col">
                            <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line break-words ${
                              isUser 
                                ? 'bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white rounded-tr-none' 
                                : 'bg-[#1E293B] text-slate-100 border border-[#2563eb]/10 rounded-tl-none'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isLoading && (
                      <div className="flex gap-2.5 max-w-[85%] mr-auto">
                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-slate-800 border border-slate-700">
                          <Bot className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <div className="bg-[#1E293B]/70 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input form */}
                  <div className="p-3 bg-slate-900/40 border-t border-[#1E293B] flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Type message to ${selectedAgent.name}...`}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-[#2563eb] text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-[#2563eb]/50 transition-all placeholder:text-slate-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] hover:opacity-90 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer border ${
          isOpen 
            ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
            : 'bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white border-none shadow-lg shadow-[#2563eb]/25'
        }`}
        title="Chat with our AI Receptionists"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
