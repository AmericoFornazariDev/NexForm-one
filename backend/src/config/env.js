import dotenv from 'dotenv';

dotenv.config();

const normalizeAiMode = (value) => {
  if (!value) {
    return 'llama';
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === 'gpt' ? 'gpt' : 'llama';
};

export const ENV = {
  PORT: process.env.PORT ?? '3000',
  jwtSecret: process.env.JWT_SECRET ?? 'chave_secreta_segura',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN ?? '2h',
  aiMode: normalizeAiMode(process.env.AI_MODE),
  openAiApiKey: process.env.OPENAI_API_KEY ?? ''
};
