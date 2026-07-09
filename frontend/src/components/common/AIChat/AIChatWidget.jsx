import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  SmartToy,
  Close,
  Send,
  Refresh,
  Summarize,
  Person,
} from '@mui/icons-material';
import api from '../../../api/axiosConfig';

// STYLED COMPONENTS
const ChatButton = styled(Fab)({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1000,
  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
    boxShadow: '0 6px 30px rgba(59, 130, 246, 0.5)',
  },
});

const ChatContainer = styled(Paper)({
  position: 'fixed',
  bottom: 90,
  right: 24,
  width: 380,
  maxWidth: 'calc(100vw - 48px)',
  height: 500,
  maxHeight: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  zIndex: 1000,
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
});

const ChatHeader = styled(Box)({
  padding: '16px 20px',
  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
});

const MessagesContainer = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  backgroundColor: '#F8FAFC',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const MessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: '85%',
  padding: '12px 16px',
  borderRadius: '12px',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? '#3B82F6' : '#FFFFFF',
  color: isUser ? 'white' : '#1E293B',
  border: isUser ? 'none' : '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  wordWrap: 'break-word',
  whiteSpace: 'pre-wrap',
}));

const MessageTime = styled(Typography)({
  fontSize: '10px',
  color: '#94A3B8',
  marginTop: '4px',
  textAlign: 'right',
});

const InputContainer = styled(Box)({
  padding: '12px 16px',
  borderTop: '1px solid #E2E8F0',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  gap: '8px',
  flexShrink: 0,
});

const QuickActions = styled(Box)({
  padding: '8px 16px',
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  borderBottom: '1px solid #E2E8F0',
  backgroundColor: '#F8FAFC',
});

// COMPONENT
const AIChatWidget = ({ weekNumber, year }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick questions
  const quickQuestions = [
    { label: '📊 Team Summary', action: 'generateSummary' },
    { label: '📈 Top Performer', action: 'Who is the top performer this week?' },
    { label: '⚠️ Blockers', action: 'What are the main blockers?' },
    { label: '💡 Insights', action: 'Give me team insights' },
  ];

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: `👋 Hello! I'm your AI team assistant. I can help you with:\n\n• Team performance overview\n• Individual member reports\n• Project progress\n• Blockers and issues\n• Weekly summaries\n\nWhat would you like to know?`,
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: messageText,
        weekNumber,
        year,
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response || 'I couldn\'t process that request.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'generateSummary') {
      generateTeamSummary();
    } else {
      sendMessage(action);
    }
  };

  const generateTeamSummary = async () => {
    setGeneratingSummary(true);
    const userMessage = {
      id: Date.now(),
      text: '📊 Generate team summary',
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.post('/ai/summary', { weekNumber, year });
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.summary || 'Could not generate summary.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Summary error:', error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Button */}
      <ChatButton onClick={toggleChat} color="primary">
        <SmartToy />
      </ChatButton>

      {/* Chat Dialog */}
      {isOpen && (
        <ChatContainer elevation={3}>
          {/* Header */}
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy />
              <Typography variant="subtitle1" fontWeight={600}>
                AI Assistant
              </Typography>
              <Chip
                label="Beta"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  height: 20,
                  fontSize: '10px',
                }}
              />
            </Box>
            <IconButton onClick={toggleChat} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </ChatHeader>

          {/* Quick Actions */}
          <QuickActions>
            {quickQuestions.map((q, idx) => (
              <Chip
                key={idx}
                label={q.label}
                onClick={() => handleQuickAction(q.action)}
                size="small"
                sx={{
                  borderRadius: '6px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  },
                }}
              />
            ))}
          </QuickActions>

          {/* Messages */}
          <MessagesContainer>
            {messages.map((msg) => (
              <Box key={msg.id}>
                <MessageBubble isUser={msg.isUser}>
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </MessageBubble>
                <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
              </Box>
            ))}
            {(loading || generatingSummary) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start', p: 1 }}>
                <CircularProgress size={16} sx={{ color: '#3B82F6' }} />
                <Typography variant="caption" color="#94A3B8">
                  {generatingSummary ? 'Generating summary...' : 'Thinking...'}
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          {/* Input */}
          <InputContainer>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything about your team..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || generatingSummary}
              inputRef={inputRef}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || loading || generatingSummary}
              sx={{
                backgroundColor: input.trim() ? '#3B82F6' : '#E2E8F0',
                color: input.trim() ? 'white' : '#94A3B8',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: input.trim() ? '#2563EB' : '#E2E8F0',
                },
              }}
            >
              <Send />
            </IconButton>
          </InputContainer>
        </ChatContainer>
      )}
    </>
  );
};

export default AIChatWidget;