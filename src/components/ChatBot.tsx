import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from './ui/button';
import { getChatResponse } from '../services/aiService';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');
    setIsLoading(true);
    try {
      const aiResponse = await getChatResponse(input);
      setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [
        ...prev,
        {
          text: "I'm sorry, I couldn't process your request. Please try again later.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-14 right-12 z-50">
      {isOpen ? (
        <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-lg shadow-2xl w-96 h-[32rem] flex flex-col animate-slideIn">
          <div className="flex justify-between items-center p-4 border-b border-purple-700">
            <h3 className="text-white font-semibold text-lg">Job Search Assistant</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'} animate-fadeIn`}
              >
                <span
                  className={`inline-block p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-purple-700 text-white shadow-md'
                  }`}
                >
                  {message.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-purple-700">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 bg-white bg-opacity-10 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:bg-opacity-20 transition duration-300 ease-in-out text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                className="rounded-l-none bg-purple-700 hover:bg-purple-800 px-4 py-3"
                disabled={isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={toggleChat}
          className="rounded-full p-6 bg-purple-700 text-white hover:bg-purple-800 shadow-lg"
        >
          <MessageSquare className="h-12 w-12" />
        </Button>
      )}
    </div>
  );
};

export default ChatBot;