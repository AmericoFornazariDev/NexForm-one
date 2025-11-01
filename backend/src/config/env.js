import dotenv from 'dotenv';

dotenv.config();

const normalizeAiMode = (value) => {
  if (!value) {
    return 'llama';
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === 'gpt' ? 'gpt' : 'llama';
};

const resolveAiModeValue = () => {
  if (process.env.AI_MODE && process.env.AI_MODE.trim()) {
    return process.env.AI_MODE;
  }

  if (process.env.AI_PROVIDER && process.env.AI_PROVIDER.trim()) {
    return process.env.AI_PROVIDER;
  }

  return undefined;
};

export const ENV = {
  PORT: process.env.PORT ?? '3000',
  jwtSecret: process.env.JWT_SECRET ?? 'chave_secreta_segura',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN ?? '2h',
  aiMode: normalizeAiMode(resolveAiModeValue()),
  aiModel: process.env.AI_MODEL?.trim() || 'gpt-4o-mini',
  openAiApiKey: process.env.OPENAI_API_KEY ?? ''
};
