import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = 'your-assistant-id'; // Assistants 플랫폼에서 복사

app.post('/chat', async (req, res) => {
  const message = req.body.message;
  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: message,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: ASSISTANT_ID
  });

  let result;
  while (true) {
    result = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    if (result.status === 'completed') break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const reply = messages.data[0].content[0].text.value;
  res.json({ reply });
});

app.listen(3000, () => {
  console.log('✅ GPT 서버가 http://localhost:3000 에서 실행 중');
});
