import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ChevronDown, Check, Sparkles } from 'lucide-react';
import './App.css';

const PERSONAS = {
  hitesh: {
    label: 'Hitesh Sir',
    tag: 'HS',
    blurb: 'Hinglish classroom, chai aur analogies',
  },
  piyush: {
    label: 'Piyush Sir',
    tag: 'PS',
    blurb: 'First-principles, deeply technical',
  },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState('hitesh');
  const [loading, setLoading] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState({});

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-grow textarea like Claude's composer
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [input]);

  const toggleThoughts = (msgId) => {
    setExpandedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    const userMessage = { id: Date.now(), sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, persona }),
      });

      if (!response.ok) throw new Error('Server responded with an error');

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.output || 'Kuch galat ho gaya, yaar.',
        think: data.think || '',
        myVideos: data.myVideos || [],
        otherVideos: data.otherVideos || [],
        otherPersona: data.otherPersona || '',
        persona,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Bhai, API load nahi ho payi. Ek baar check karo ki server run ho raha hai ya nahi.',
          persona,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadSuggestion = (suggestion) => handleSend(suggestion);

  return (
    <div className="flex flex-col h-screen bg-[#262624] text-[#ECEAE4] font-sans overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center max-w-2xl mx-auto text-center px-6 space-y-7">
            <div className="w-14 h-14 rounded-2xl bg-[#D97757]/10 border border-[#D97757]/25 flex items-center justify-center text-[#D97757]">
              <Sparkles size={26} />
            </div>
            <div className="space-y-2.5">
              <h1 className="text-[2rem] font-serif text-[#ECEAE4] tracking-tight">
                Tech seekho, persona style mein
              </h1>
              <p className="text-[#9C9A93] text-[15px] max-w-md mx-auto leading-relaxed">
                Apne favorite educators ki tone aur analogies ke saath mushkil concepts ko aasan bhasha mein samjho.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-3">
              <button
                onClick={() => {
                  setPersona('piyush');
                  loadSuggestion('REST API kya hoti hai? First-principles se samjhao.');
                }}
                className="p-4 bg-[#2D2C2A] hover:bg-[#33322F] border border-[#3F3E3A] hover:border-[#D97757]/40 rounded-xl transition text-left space-y-1"
              >
                <span className="text-xs font-semibold text-[#D97757]">Piyush Sir</span>
                <p className="text-[14px] font-medium text-[#ECEAE4]">REST API kya hoti hai?</p>
                <p className="text-xs text-[#6F6D67]">First-principles explanation</p>
              </button>

              <button
                onClick={() => {
                  setPersona('hitesh');
                  loadSuggestion('Frontend vs Backend ki restaurant analogy dekar samjhao.');
                }}
                className="p-4 bg-[#2D2C2A] hover:bg-[#33322F] border border-[#3F3E3A] hover:border-[#D97757]/40 rounded-xl transition text-left space-y-1"
              >
                <span className="text-xs font-semibold text-[#D97757]">Hitesh Sir</span>
                <p className="text-[14px] font-medium text-[#ECEAE4]">Frontend vs Backend analogy</p>
                <p className="text-xs text-[#6F6D67]">Restaurant aur waiter wali teaching</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-7">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-[fadein_0.25s_ease-out] ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-[#D97757] flex items-center justify-center flex-shrink-0 font-serif font-semibold text-[11px] text-[#262624] mt-0.5">
                    {PERSONAS[msg.persona]?.tag}
                  </div>
                )}

                <div className="max-w-[85%] space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#6F6D67]">
                    <span>{msg.sender === 'user' ? 'Aap' : PERSONAS[msg.persona]?.label}</span>
                    <span>·</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.sender === 'ai' && msg.think && (
                    <div className="text-xs">
                      <button
                        onClick={() => toggleThoughts(msg.id)}
                        className="flex items-center gap-1.5 text-[#6F6D67] hover:text-[#9C9A93] transition font-medium"
                      >
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${expandedThoughts[msg.id] ? 'rotate-180' : ''}`}
                        />
                        Thought process
                      </button>
                      {expandedThoughts[msg.id] && (
                        <div className="mt-1.5 pl-3 border-l-2 border-[#3F3E3A] text-[#6F6D67] whitespace-pre-line leading-relaxed">
                          {msg.think}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[15px] leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                        ? 'bg-[#35342F] rounded-2xl px-4 py-2.5 text-[#ECEAE4]'
                        : 'text-[#ECEAE4]'
                      }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'ai' && (msg.myVideos?.length > 0 || msg.otherVideos?.length > 0) && (
                    <div className="mt-3.5 space-y-4">

                      {msg.myVideos?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-[#D97757] tracking-wider uppercase">
                            📺 {PERSONAS[msg.persona]?.label || 'My'} ke Videos
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.myVideos.map(video => (
                              <a
                                key={video.id}
                                href={video.type === 'playlist'
                                  ? `https://www.youtube.com/playlist?list=${video.id}`
                                  : `https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 bg-[#2D2C2A] hover:bg-[#33322F] border border-[#3F3E3A] hover:border-[#D97757]/40 rounded-xl transition text-left group shadow-sm"
                              >
                                <img src={video.thumbnail} className="w-20 h-12 object-cover rounded-lg flex-shrink-0" alt="" />
                                <div className="min-w-0">
                                  <p className="text-[12px] font-semibold text-[#ECEAE4] line-clamp-2 leading-snug group-hover:text-[#D97757] transition-colors">{video.title}</p>
                                  <span className="text-[10px] text-[#6F6D67]">{video.type === 'playlist' ? '📁 Playlist' : '▶ Watch on YouTube'}</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.otherVideos?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-[#8B8AE5] tracking-wider uppercase">
                            🤝 {PERSONAS[msg.otherPersona]?.label || 'Other Sir'} ke bhi Videos hain!
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.otherVideos.map(video => (
                              <a
                                key={video.id}
                                href={video.type === 'playlist'
                                  ? `https://www.youtube.com/playlist?list=${video.id}`
                                  : `https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 bg-[#2A2A3A] hover:bg-[#30304A] border border-[#3A3A5A] hover:border-[#8B8AE5]/40 rounded-xl transition text-left group shadow-sm"
                              >
                                <img src={video.thumbnail} className="w-20 h-12 object-cover rounded-lg flex-shrink-0" alt="" />
                                <div className="min-w-0">
                                  <p className="text-[12px] font-semibold text-[#ECEAE4] line-clamp-2 leading-snug group-hover:text-[#8B8AE5] transition-colors">{video.title}</p>
                                  <span className="text-[10px] text-[#6F6D67]">{video.type === 'playlist' ? '📁 Playlist' : '▶ Watch on YouTube'}</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#3F3E3A] flex items-center justify-center flex-shrink-0 text-[#9C9A93] font-medium text-[11px] mt-0.5">
                    U
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#D97757] flex items-center justify-center flex-shrink-0 font-serif font-semibold text-[11px] text-[#262624] mt-0.5">
                  {PERSONAS[persona].tag}
                </div>
                <div className="flex items-center gap-1.5 text-[#6F6D67] text-sm pt-1">
                  <span className="w-1.5 h-1.5 bg-[#D97757] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#D97757] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#D97757] rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="text-xs ml-1">Soch rahe hain...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer — model picker lives inside, like Claude */}
      <div className="px-4 md:px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#2D2C2A] border border-[#3F3E3A] focus-within:border-[#D97757]/50 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${PERSONAS[persona].label} anything...`}
              rows={1}
              className="w-full pt-4 px-4 bg-transparent outline-none resize-none text-[#ECEAE4] text-[15px] max-h-[200px] placeholder-[#6F6D67]"
            />

            {/* Bottom toolbar row: persona picker (left) + send button (right) */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setPersonaMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#3A3936] transition text-[13px] font-medium text-[#9C9A93]"
                >
                  <span className="text-[#ECEAE4] font-serif">{PERSONAS[persona].label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${personaMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {personaMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-60 bg-[#2D2C2A] border border-[#3F3E3A] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] py-1.5 z-20">
                    {Object.entries(PERSONAS).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setPersona(key);
                          setPersonaMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#35342F] transition text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#ECEAE4] font-serif">{p.label}</p>
                          <p className="text-xs text-[#6F6D67]">{p.blurb}</p>
                        </div>
                        {persona === key && <Check size={15} className="text-[#D97757] flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition ${input.trim() && !loading
                    ? 'bg-[#D97757] hover:bg-[#C86647] text-[#262624] cursor-pointer'
                    : 'bg-[#3A3936] text-[#5D5B56] cursor-not-allowed'
                  }`}
              >
                <ArrowUp size={15} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center text-[#6F6D67] mt-2.5">
            Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;