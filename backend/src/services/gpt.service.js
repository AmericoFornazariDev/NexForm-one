import '../config/env.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const FALLBACK_MODEL = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';

const normalizeMessages = (input) => {
  if (Array.isArray(input)) {
    return input
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const role = typeof entry.role === 'string' ? entry.role.trim() : '';
        const content = typeof entry.content === 'string' ? entry.content.trim() : '';

        if (!role || !content) {
          return null;
        }

        return { role, content };
      })
      .filter(Boolean);
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? [{ role: 'user', content: trimmed }] : [];
  }

  return [];
};

export const generateReply = async (messagesInput) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const messages = normalizeMessages(messagesInput);
  if (messages.length === 0) {
    throw new Error('Messages array must contain at least one entry');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: FALLBACK_MODEL,
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenAI API request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new Error('OpenAI response does not contain valid content');
  }

  return content.trim();
};
