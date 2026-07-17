import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Send, MessageSquare, Volume2, Sparkles } from 'lucide-react';

interface Message {
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface DialerSimProps {
  agentName?: string;
  agentVoice?: string;
  onAppointmentBooked?: (name: string, vehicle: string, service: string) => void;
  isFloating?: boolean;
}

export default function DialerSim({ 
  agentName = "Health Reception AI", 
  agentVoice = "Alloy - Neutral",
  onAppointmentBooked,
  isFloating = false
}: DialerSimProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [duration, setDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookingState, setBookingState] = useState<{ step: number; name: string; vehicle: string; service: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false); // Used only if isFloating

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a pleasant female/neutral English voice
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira'))) || voices[0];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback animations
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  // Scroll transcript to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Duration Timer
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Start Call
  const startCall = () => {
    setIsCalling(true);
    setTranscript([]);
    setDuration(0);
    setBookingState(null);
    
    const welcomeMsg = `Hello! Thank you for calling AutoCare Pro Garage support. I am ${agentName}, your AI receptionist. How can I help you today?`;
    
    // Add welcome message with a slight delay
    setTimeout(() => {
      setTranscript([
        { sender: 'agent', text: welcomeMsg, timestamp: formatDuration(0) }
      ]);
      speakText(welcomeMsg);
    }, 600);
  };

  // End Call
  const endCall = () => {
    setIsCalling(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Handle Voice responses
  const handleAIResponse = (userText: string) => {
    const textLower = userText.toLowerCase();
    let reply = "";

    // Booking appointment state machine simulation
    if (bookingState) {
      if (bookingState.step === 1) {
        // Asked for service, expecting service name or vehicle
        const service = userText;
        setBookingState({ ...bookingState, step: 2, service });
        reply = `Got it, a ${service}. And what is your vehicle make, model and year?`;
      } else if (bookingState.step === 2) {
        // Asked for vehicle
        const vehicle = userText;
        setBookingState({ ...bookingState, step: 3, vehicle });
        reply = `Excellent. I have a slot available this Saturday at 10:00 AM for your ${vehicle} ${bookingState.service}. May I please have your full name to lock this in?`;
      } else if (bookingState.step === 3) {
        // Got name, finalizing booking!
        const name = userText;
        reply = `Awesome, ${name}! Your appointment is fully confirmed for Saturday at 10:00 AM for the ${bookingState.service}. We look forward to seeing you at AutoCare Pro Garage!`;
        
        // Trigger parent booking callback to save in app state!
        if (onAppointmentBooked) {
          onAppointmentBooked(name, bookingState.vehicle || '2019 Toyota Camry', bookingState.service || 'Oil Change');
        }
        setBookingState(null);
      }
    } else {
      // General Q&A
      if (textLower.includes('oil') || textLower.includes('lub') || textLower.includes('change')) {
        setBookingState({ step: 1, name: '', vehicle: '', service: 'Oil Change' });
        reply = "I would be happy to book an Oil Change for you! Our premium service is $49.99. What vehicle is this for?";
      } else if (textLower.includes('brake') || textLower.includes('squeak') || textLower.includes('inspect')) {
        setBookingState({ step: 1, name: '', vehicle: '', service: 'Brake Inspection' });
        reply = "I can definitely schedule a Brake Inspection for you. It's starting from $39.99 and includes a comprehensive fluid & pad check. What is the vehicle model?";
      } else if (textLower.includes('hour') || textLower.includes('open') || textLower.includes('time') || textLower.includes('sunday')) {
        reply = "AutoCare Pro Garage is open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM. We are closed on Sundays.";
      } else if (textLower.includes('diagnostic') || textLower.includes('check engine')) {
        reply = "Yes! We offer professional computer diagnostics. We can read fault codes and trace engine issues. Would you like to book a diagnostic session?";
      } else if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('charge')) {
        reply = "Our basic Brake Inspection is $39.99, an Oil Change is $49.99, and tire rotation is $29.99. For other custom repairs, our technician provides a free quote after inspection!";
      } else if (textLower.includes('where') || textLower.includes('address') || textLower.includes('location')) {
        reply = "We are located at 742 Market Street, San Francisco, California 94103. Right in the heart of downtown!";
      } else {
        reply = "I can help you book a service like an Oil Change, check our business hours, or answer pricing questions. What would you like to do?";
      }
    }

    // Add response
    setTimeout(() => {
      setTranscript(prev => [
        ...prev,
        { sender: 'agent', text: reply, timestamp: formatDuration(duration) }
      ]);
      speakText(reply);
    }, 800);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || !isCalling) return;

    const newMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: formatDuration(duration)
    };

    setTranscript(prev => [...prev, newMsg]);
    setInputText('');
    handleAIResponse(textToSend);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const currentWidget = (
    <div className="bg-[#0e1322] border border-[#3B82F6]/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-[520px]">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center border border-[#3B82F6]/30">
            <Volume2 className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              {agentName}
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]"></span>
              </span>
            </h3>
            <p className="text-xs text-gray-400">{agentVoice}</p>
          </div>
        </div>
        {isCalling && (
          <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-full border border-[#3B82F6]/20">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Body: Transcript or Calling Screen */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!isCalling ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#3B82F6]/20 rounded-full blur-xl animate-pulse"></div>
              <button 
                onClick={startCall}
                className="w-20 h-20 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#3B82F6]/30 cursor-pointer relative z-10"
              >
                <Phone className="w-9 h-9 text-white fill-current" />
              </button>
            </div>
            <h4 className="text-white font-semibold text-lg mb-2">Simulate Live Voice Call</h4>
            <p className="text-gray-400 text-xs max-w-xs mb-4">
              Click the call button to speak directly to the AI Receptionist. Make sure your speakers are on!
            </p>
            <div className="text-[10px] text-gray-500 font-mono border border-gray-800/60 bg-gray-950/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] animate-pulse" />
              Bypassing API limits — Client-side simulation
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full justify-between">
            {/* Live Transcript Panel */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent max-h-[300px]"
            >
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-500 italic">
                  Dialing and connecting...
                </div>
              ) : (
                transcript.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-tr-none' 
                        : 'bg-gray-900 text-gray-100 border border-gray-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Helper suggestions */}
            {transcript.length > 0 && (
              <div className="mb-3.5">
                <p className="text-[10px] text-gray-500 font-medium mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#3B82F6]" /> Choose what to say:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
                  <button 
                    onClick={() => handleQuickPrompt("I'd like to book an oil change")}
                    className="text-[11px] bg-gray-900 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] text-gray-300 px-2.5 py-1 rounded-full border border-gray-800 hover:border-[#3B82F6]/30 transition-all text-left cursor-pointer"
                  >
                    🗓️ Book Oil Change
                  </button>
                  <button 
                    onClick={() => handleQuickPrompt("What are your business hours?")}
                    className="text-[11px] bg-gray-900 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] text-gray-300 px-2.5 py-1 rounded-full border border-gray-800 hover:border-[#3B82F6]/30 transition-all text-left cursor-pointer"
                  >
                    ⏰ Check business hours
                  </button>
                  <button 
                    onClick={() => handleQuickPrompt("How much is a brake inspection?")}
                    className="text-[11px] bg-gray-900 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] text-gray-300 px-2.5 py-1 rounded-full border border-gray-800 hover:border-[#3B82F6]/30 transition-all text-left cursor-pointer"
                  >
                    💲 Check brake pricing
                  </button>
                  <button 
                    onClick={() => handleQuickPrompt("Do you do engine diagnostics?")}
                    className="text-[11px] bg-gray-900 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] text-gray-300 px-2.5 py-1 rounded-full border border-gray-800 hover:border-[#3B82F6]/30 transition-all text-left cursor-pointer"
                  >
                    🛠️ Engine diagnostics?
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Waveform Simulation */}
            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-[3px] h-7 w-20">
                  <div className={`w-[3px] bg-[#3B82F6] rounded-full h-2 ${isSpeaking ? 'animate-wave-1' : ''}`}></div>
                  <div className={`w-[3px] bg-[#3B82F6] rounded-full h-4 ${isSpeaking ? 'animate-wave-2' : ''}`}></div>
                  <div className={`w-[3px] bg-[#8B5CF6] rounded-full h-6 ${isSpeaking ? 'animate-wave-3' : ''}`}></div>
                  <div className={`w-[3px] bg-[#3B82F6] rounded-full h-3 ${isSpeaking ? 'animate-wave-4' : ''}`}></div>
                  <div className={`w-[3px] bg-[#3B82F6] rounded-full h-5 ${isSpeaking ? 'animate-wave-5' : ''}`}></div>
                  <div className={`w-[3px] bg-[#8B5CF6] rounded-full h-2 ${isSpeaking ? 'animate-wave-2' : ''}`}></div>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {isSpeaking ? 'AI is speaking...' : 'Ready to listen...'}
                </span>
              </div>

              {/* End Call button */}
              <button 
                onClick={endCall}
                className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg border border-red-500/30 transition-all flex items-center gap-1 text-xs cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Hang Up</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer text field to chat manually */}
      {isCalling && (
        <div className="mt-3.5 border-t border-gray-800 pt-3 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Type your message and click send..." 
            className="flex-1 bg-gray-950 border border-gray-800 focus:border-[#3B82F6] text-xs text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#3B82F6]"
          />
          <button 
            onClick={() => handleSendMessage(inputText)}
            className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-3 rounded-lg flex items-center justify-center transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  if (!isFloating) {
    return currentWidget;
  }

  // Floating Widget Render style (bottom right floating button + popover modal)
  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[380px] sm:w-[420px] transition-all duration-300 transform translate-y-0 opacity-100">
          <div className="shadow-2xl shadow-emerald-950/50">
            {currentWidget}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="relative group">
        {!isOpen && (
          <span className="absolute -top-12 right-0 bg-[#0e1322] border border-[#3B82F6]/30 text-[#3B82F6] text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Talk to AI receptionist! 📞
          </span>
        )}
        <button
          id="floating-phone-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border ${
            isOpen 
              ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
              : 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white border-none shadow-md shadow-[#3B82F6]/25 animate-bounce'
          }`}
        >
          {isOpen ? (
            <PhoneOff className="w-6 h-6" />
          ) : (
            <Phone className="w-6 h-6 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}
