import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I am your AI Assistant. I can analyze project labor costs, HR compliance, payroll trends, and more. What would you like to know?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses = {
    "how many employees": "Based on the current data, you have 2 employees actively registered in the system (1 Saudi, 1 Non-Saudi). Both are currently marked as Active.",
    "expired documents": "I found 1 employee with an expired Iqama: Sarah Khalid (Expired on 2024-04-30). Also, her employment contract has expired.",
    "payroll last month": "Last month's total estimated payroll across all projects was SAR 27,000 in Basic Salaries plus SAR 9,450 in Allowances, totaling SAR 36,450 before deductions.",
    "highest labor cost": "Project Alpha currently has the highest estimated labor cost allocation, accounting for the senior engineering staff.",
    "loan balance": "There is currently 1 active employee loan (Ahmed Abdullah) with an outstanding balance of SAR 4,000.",
  };

  const handleSend = () => {
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setQuery('');
    setIsTyping(true);
    
    const lowercaseQuery = query.toLowerCase();
    let responseText = "I don't have enough data to answer that specifically right now. Please try asking about 'expired documents', 'payroll', or 'loan balances'.";
    
    Object.keys(mockResponses).forEach(key => {
      if (lowercaseQuery.includes(key)) {
        responseText = mockResponses[key];
      }
    });

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 32, right: 32, width: 64, height: 64, borderRadius: 32,
          background: 'linear-gradient(135deg, #0a84ff, #8b5cf6)', color: 'white', border: 'none',
          boxShadow: '0 12px 24px rgba(10,132,255,0.3)', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Bot size={32} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: 110, right: 32, width: 380, height: 600,
              background: 'white', borderRadius: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.05)', zIndex: 100, display: 'flex', flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #0a84ff, #8b5cf6)', padding: 24, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkles size={20} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>ERP Intelligence</div>
                  <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>Powered by GlobalAI</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.5, fontWeight: 500,
                    background: m.role === 'user' ? '#0f172a' : 'white',
                    color: m.role === 'user' ? 'white' : '#0f172a',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12 }}>
                    Analyzing data...
                  </motion.div>
                </div>
              )}
            </div>

            <div style={{ padding: 16, background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f1f5f9', padding: '8px 16px', borderRadius: 20 }}>
                <input 
                  type="text" 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about payroll, loans, expiry..."
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 600, color: '#0f172a' }}
                />
                <button onClick={handleSend} style={{ background: '#0a84ff', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
                  <Send size={14} style={{ marginLeft: -2 }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgent;
