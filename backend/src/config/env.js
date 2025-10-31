import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ?? '3000',
  jwtSecret: process.env.JWT_SECRET ?? 'chave_secreta_segura',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN ?? '2h'
};
