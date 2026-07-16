# AI Dungeon Bot

A ChatGPT-like bot server designed for interactive storytelling and adventure games inspired by AI Dungeon.

## Features

✨ **ChatGPT-like Intelligence** - Powered by OpenAI's GPT models

🎭 **Multi-Session Support** - Manage multiple concurrent chat sessions

📖 **Story Context** - Maintain conversation history for immersive narratives

⚡ **RESTful API** - Easy integration with frontend applications

🎮 **Customizable System Prompts** - Tailor bot behavior for different adventure types

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/account/api-keys))

### Installation

1. Clone the repository

```bash
git clone https://github.com/SkillgameDEV/bot.git
cd bot
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file from `.env.example`

```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`

```
OPENAI_API_KEY=sk-your-key-here
```

5. Start the server

```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Create Session

**POST** `/api/sessions`

Create a new chat session.

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are a dungeon master in a fantasy adventure..."
  }'
```

**Response:**
```json
{
  "sessionId": "uuid-string",
  "message": "Chat session created",
  "systemPrompt": "You are a dungeon master..."
}
```

### Send Message

**POST** `/api/chat`

Send a message and get a bot response.

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "message": "I enter the tavern"
  }'
```

**Response:**
```json
{
  "sessionId": "uuid-string",
  "userMessage": "I enter the tavern",
  "botResponse": "You push open the heavy wooden door...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "tokenUsage": {
    "prompt": 50,
    "completion": 100,
    "total": 150
  }
}
```

### Get Session History

**GET** `/api/sessions/:sessionId/history`

Retrieve chat history for a session.

```bash
curl http://localhost:3000/api/sessions/uuid-string/history
```

### Delete Session

**DELETE** `/api/sessions/:sessionId`

End a chat session.

```bash
curl -X DELETE http://localhost:3000/api/sessions/uuid-string
```

## Example: Complete Workflow

```bash
# 1. Create a new adventure session
SESSION=$(curl -s -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are an experienced dungeon master. Describe the scene vividly and offer 3 choices for what the player can do next."
  }' | jq -r '.sessionId')

echo "Session: $SESSION"

# 2. Start the adventure
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION\", \"message\": \"Start a new fantasy adventure in a castle\"}" | jq

# 3. Continue the story
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION\", \"message\": \"I choose the first option\"}" | jq

# 4. View history
curl -s http://localhost:3000/api/sessions/$SESSION/history | jq
```

## Project Structure

```
bot/
├── server.js          # Main Express server
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # Documentation
```

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `BOT_TEMPERATURE` - Model temperature (0-2, default: 0.7)
- `BOT_MAX_TOKENS` - Max response length (default: 2000)
- `MODEL` - OpenAI model (default: gpt-3.5-turbo)

## Next Steps

- [ ] Add MongoDB/PostgreSQL for persistent storage
- [ ] Implement user authentication
- [ ] Create web frontend (React/Vue)
- [ ] Add user-specific adventure templates
- [ ] Implement token rate limiting
- [ ] Add content filtering
- [ ] Deploy to production (Heroku, AWS, etc.)

## License

MIT
