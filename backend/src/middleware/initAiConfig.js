import { AiConfigModel } from '../models/ai_config.model.js';

export const initAiConfig = (req, _res, next) => {
  const userId = req?.user?.id;

  if (!userId) {
    return next();
  }

  const existingConfig = AiConfigModel.getConfigByUser(userId);

  if (!existingConfig) {
    AiConfigModel.upsertConfig(userId, AiConfigModel.DEFAULT_CONFIG);
  }

  return next();
};

