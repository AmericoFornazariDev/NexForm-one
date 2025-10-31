import { FormModel } from '../models/form.model.js';
import { ResponseModel } from '../models/response.model.js';
import { AiConfigModel } from '../models/ai_config.model.js';
import { InsightService } from '../services/ai/insight.service.js';
import { ENV } from '../config/env.js';
import { generateCSV, generatePDF } from '../utils/exporter.js';

const ensureOwnership = (form, userId) => {
  if (!form) {
    return { status: 404, message: 'Formulário não encontrado' };
  }

  if (Number(form.user_id) !== Number(userId)) {
    return { status: 403, message: 'Acesso negado a este formulário' };
  }

  return null;
};

const computeNpsScore = (buckets) => {
  if (!buckets) {
    return null;
  }

  const { promoters = 0, passives = 0, detractors = 0, total = 0 } = buckets;
  if (!total) {
    return null;
  }

  const promotersPct = (promoters / total) * 100;
  const detractorsPct = (detractors / total) * 100;
  return Number((promotersPct - detractorsPct).toFixed(2));
};

const extractAnswerText = (payload) => {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (typeof payload.answer === 'string') {
    return payload.answer.trim();
  }

  if (typeof payload.user_input === 'string') {
    return payload.user_input.trim();
  }

  if (typeof payload.reply === 'string') {
    return payload.reply.trim();
  }

  if (typeof payload.value === 'string') {
    return payload.value.trim();
  }

  try {
    return JSON.stringify(payload);
  } catch (error) {
    return '';
  }
};

const normalizeMode = (mode) => {
  const value = String(mode ?? '').trim().toLowerCase();
  return value === 'gpt' ? 'gpt' : 'llama';
};

export const globalReport = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const forms = FormModel.getFormsByUser(userId);
    if (!forms.length) {
      return res.json([]);
    }

    const summary = forms.map((form) => {
      const responsesTotal = ResponseModel.countByForm(form.id);
      const buckets = ResponseModel.extractNPSBuckets(form.id);
      const npsScore = computeNpsScore(buckets);
      const latest = ResponseModel.findRecentByForm(form.id, 1)?.[0];

      return {
        id: form.id,
        title: form.title,
        responses: responsesTotal,
        nps: npsScore === null ? null : Math.round(npsScore),
        updated: latest?.created_at ?? form.created_at,
      };
    });

    summary.sort((a, b) => {
      const parseTime = (value) => {
        if (!value) {
          return 0;
        }

        const time = new Date(value).getTime();
        return Number.isFinite(time) ? time : 0;
      };

      return parseTime(b.updated) - parseTime(a.updated);
    });

    return res.json(summary);
  } catch (error) {
    console.error('Failed to build global report summary:', error);
    return res.status(500).json({ message: 'Erro ao gerar o relatório global' });
  }
};

export const exportPDF = async (req, res) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return res.status(400).json({ message: 'formId é obrigatório' });
    }

    const form = FormModel.getFormById(formId);
    const ownershipError = ensureOwnership(form, req.user?.id);
    if (ownershipError) {
      return res.status(ownershipError.status).json({ message: ownershipError.message });
    }

    const responses = ResponseModel.getResponsesByForm(form.id);
    const buckets = ResponseModel.extractNPSBuckets(form.id);
    const stats = {
      responses: responses.length,
      nps: computeNpsScore(buckets),
      updated: responses.length ? responses[responses.length - 1].created_at : form.created_at,
      buckets,
    };

    let insights = [];
    if (responses.length) {
      const limit = Math.min(responses.length, 200);
      const recent = responses.slice(Math.max(responses.length - limit, 0));
      const answersText = recent
        .map((entry) => extractAnswerText(entry?.data))
        .map((text) => (typeof text === 'string' ? text.trim() : ''))
        .filter((text) => text.length > 0);

      if (answersText.length) {
        try {
          const aiConfig = AiConfigModel.getConfigByUser(form.user_id);
          const resolvedMode = normalizeMode(form.ai_mode ?? aiConfig?.ai_mode ?? ENV.aiMode);
          const generated = await InsightService.generate({ aiMode: resolvedMode, answersText });

          if (Array.isArray(generated?.insights)) {
            insights = generated.insights
              .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
              .map((text) => text.trim())
              .filter((text) => text.length > 0);
          } else if (typeof generated === 'string') {
            const trimmed = generated.trim();
            if (trimmed.length > 0) {
              insights = [trimmed];
            }
          } else {
            const summary = generated?.summary ?? generated?.text ?? generated?.insight;
            if (summary) {
              const text = String(summary).trim();
              if (text.length > 0) {
                insights = [text];
              }
            }
          }
        } catch (aiError) {
          console.warn('Falha ao gerar insights para exportação PDF:', aiError);
        }
      }
    }

    const pdfBuffer = await generatePDF(form, stats, insights);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${form.id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Failed to export PDF report:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório em PDF' });
  }
};

export const exportCSV = (req, res) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return res.status(400).json({ message: 'formId é obrigatório' });
    }

    const form = FormModel.getFormById(formId);
    const ownershipError = ensureOwnership(form, req.user?.id);
    if (ownershipError) {
      return res.status(ownershipError.status).json({ message: ownershipError.message });
    }

    const responses = ResponseModel.getResponsesByForm(form.id);
    const rows = responses.map((response) => ({
      id: response.id,
      form_id: response.form_id,
      response_text: extractAnswerText(response?.data),
      created_at: response.created_at,
    }));

    const csv = `\uFEFF${generateCSV(rows)}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="responses_${form.id}.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('Failed to export CSV responses:', error);
    return res.status(500).json({ message: 'Erro ao exportar respostas em CSV' });
  }
};
