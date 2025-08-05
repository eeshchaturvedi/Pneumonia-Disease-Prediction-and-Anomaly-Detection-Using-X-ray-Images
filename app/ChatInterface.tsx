import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Clock, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
}

interface ChatInterfaceProps {
  patientData: {
    name: string;
    age: string;
    gender: string;
  };
  hasPneumonia: boolean;
}

export const ChatInterface = ({ patientData, hasPneumonia }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial bot message based on pneumonia detection
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      type: 'bot',
      content: hasPneumonia 
        ? `I've detected pneumonia in ${patientData.name}'s chest X-ray. To provide the best treatment recommendations, I need to gather some additional medical history and current symptoms. Let's start with a few questions.`
        : `Good news! The analysis shows no signs of pneumonia in ${patientData.name}'s chest X-ray. However, I'm here to help with any questions you might have about the results or general respiratory health.`,
      timestamp: new Date(),
      suggestedActions: hasPneumonia 
        ? ['Tell me about current symptoms', 'Medical history questions', 'Treatment options']
        : ['Explain the results', 'Preventive care', 'General questions']
    };

    setMessages([initialMessage]);

    if (hasPneumonia) {
      // Follow up with symptom questions after a brief delay
      setTimeout(() => {
        const followUpMessage: Message = {
          id: '2',
          type: 'bot',
          content: 'Let\'s start with the current symptoms. Is the patient experiencing any of the following: cough, fever, shortness of breath, chest pain, or fatigue?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);
      }, 2000);
    }
  }, [hasPneumonia, patientData.name]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const simulateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Symptom responses
    if (lowerMessage.includes('cough') || lowerMessage.includes('fever') || lowerMessage.includes('shortness') || lowerMessage.includes('chest pain')) {
      return 'Thank you for that information. Based on the symptoms you\'ve described along with the X-ray findings, this confirms our pneumonia diagnosis. How long have these symptoms been present? This will help determine the urgency of treatment.';
    }
    
    if (lowerMessage.includes('history') || lowerMessage.includes('medical')) {
      return 'Please tell me about any relevant medical history: Does the patient have any chronic conditions like diabetes, COPD, or heart disease? Are they currently taking any medications? Any allergies to antibiotics?';
    }
    
    if (lowerMessage.includes('treatment') || lowerMessage.includes('therapy')) {
      return 'Based on the moderate pneumonia detected and the symptoms provided, I recommend: 1) Immediate antibiotic therapy (amoxicillin-clavulanate or azithromycin), 2) Supportive care with rest and fluids, 3) Follow-up chest X-ray in 7-10 days, 4) Monitor for worsening symptoms. Please consult with a physician for proper prescription and monitoring.';
    }
    
    if (lowerMessage.includes('days') || lowerMessage.includes('week')) {
      return 'If symptoms have been present for more than 2-3 days and are worsening, this suggests an active infection that requires prompt treatment. I recommend starting antibiotic therapy as soon as possible and monitoring the patient closely.';
    }
    
    // General responses
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else about the diagnosis or treatment plan you\'d like me to explain?';
    }
    
    // Default response
    return 'I understand your concern. Could you please provide more specific details about the symptoms or medical history? This will help me give you more targeted recommendations for the pneumonia treatment.';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: simulateBotResponse(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <Card className="shadow-medical bg-gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Medical Assistant Chat
          {hasPneumonia && (
            <Badge variant="secondary" className="ml-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Active Consultation
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get personalized medical insights and treatment recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="h-96 w-full border border-border/50 rounded-lg bg-background/50">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-medical text-primary-foreground'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`flex-1 space-y-2 ${
                  message.type === 'user' ? 'items-end' : 'items-start'
                } flex flex-col`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-card border border-border/50 shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  
                  {message.suggestedActions && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.suggestedActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedAction(action)}
                          className="text-xs border-primary/30 hover:bg-primary/10 hover:border-primary"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-medical flex items-center justify-center text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card border border-border/50 rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe symptoms, ask questions, or request treatment advice..."
            className="flex-1 bg-background/70"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-medical hover:shadow-hover transition-all duration-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          This AI assistant provides general medical information. Always consult with a healthcare professional for proper diagnosis and treatment.
        </div>
      </CardContent>
    </Card>
  );
};