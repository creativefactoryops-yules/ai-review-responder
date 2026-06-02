require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.post('/api/respond', async (req, res) => {
  try {
    const { reviewText, rating, sentiment, tone, businessName, respondAs } = req.body;
    if (!reviewText) return res.status(400).json({ error: 'Review text required' });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
    
    const sysMsg = `You write warm, human-sounding review responses. Tone: ${tone}. Rating: ${rating}/5. Sentiment: ${sentiment}.${businessName ? ' Business: ' + businessName : ''}${respondAs ? ' Respond as: ' + respondAs : ''}. Never mention AI. 3-6 sentences.`;
    
    const r = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: sysMsg },
        { role: 'user', content: 'Write a response to: "' + reviewText + '"' }
      ],
      temperature: 0.7, max_tokens: 300
    });
    
    const response = r.choices[0].message.content.trim();
    
    const r2 = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: sysMsg + ' Write in a different style.' },
        { role: 'user', content: 'Write a response to: "' + reviewText + '"' }
      ],
      temperature: 0.9, max_tokens: 300
    });
    
    res.json({ response, suggestions: [r2.choices[0].message.content.trim()] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Review Responder on :' + PORT));
