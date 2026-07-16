const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for chat sessions (use database in production)
const sessions = new Map();

// ==================== API Routes ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bot server is running' });
});

// Create a new chat session
app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  const systemPrompt = req.body.systemPrompt || 
    'You are a helpful AI assistant in an interactive fantasy adventure. Respond with engaging narrative and offer choices for the user.';
  
  sessions.set(sessionId, {
    id: sessionId,
    created: new Date(),
    messages: [
      { role: 'system', content: systemPrompt }
    ],
    systemPrompt
  });

  res.status(201).json({
    sessionId,
    message: 'Chat session created',
    systemPrompt
  });
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    id: session.id,
    created: session.created,
    messageCount: session.messages.length - 1, // Exclude system message
    systemPrompt: session.systemPrompt
  });
});

// Send message and get response
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.MODEL || 'gpt-3.5-turbo',
      messages: session.messages,
      temperature: parseFloat(process.env.BOT_TEMPERATURE) || 0.7,
      max_tokens: parseInt(process.env.BOT_MAX_TOKENS) || 2000,
    });

    const assistantMessage = response.choices[0].message.content;

    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    res.json({
      sessionId,
      userMessage: message,
      botResponse: assistantMessage,
      timestamp: new Date(),
      tokenUsage: {
        prompt: response.usage.prompt_tokens,
        completion: response.usage.completion_tokens,
        total: response.usage.total_tokens
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

// Get chat history
app.get('/api/sessions/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Return all messages except the system message
  const history = session.messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));

  res.json({
    sessionId,
    history
  });
});

// Clear a session
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    res.json({ message: 'Session deleted' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Bot server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation at http://localhost:${PORT}/api`);
});

module.exports = app;
