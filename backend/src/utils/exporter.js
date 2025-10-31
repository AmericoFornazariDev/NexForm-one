import PDFDocument from 'pdfkit';

const formatPercent = (part, total) => {
  if (!total) {
    return '0%';
  }

  return `${((part / total) * 100).toFixed(1)}%`;
};

const buildBar = (value, total) => {
  if (!total || !value) {
    return '';
  }

  const MAX_WIDTH = 20;
  const length = Math.max(1, Math.round((value / total) * MAX_WIDTH));
  return '█'.repeat(length);
};

export const generateCSV = (rows) => {
  const header = ['id', 'form_id', 'response_text', 'created_at'];
  const sanitize = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const lines = [header.join(';')];
  for (const row of rows) {
    const values = header.map((key) => sanitize(row?.[key] ?? ''));
    lines.push(values.join(';'));
  }

  return lines.join('\n');
};

export const generatePDF = (form, stats, insights = []) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error) => reject(error));

      doc.fontSize(20).text(`Relatório Consolidado`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(form?.title ?? 'Formulário', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(12);
      doc.text(`Total de respostas: ${stats?.responses ?? 0}`);
      doc.text(`NPS médio: ${
        typeof stats?.nps === 'number' ? `${stats.nps.toFixed(2)}` : 'Sem dados'
      }`);
      doc.text(`Última atualização: ${stats?.updated ?? 'Sem respostas'}`);
      doc.moveDown();

      doc.fontSize(14).text('Insights', { underline: true });
      doc.moveDown(0.5);

      if (Array.isArray(insights) && insights.length > 0) {
        doc.fontSize(12);
        insights.forEach((insight, index) => {
          doc.text(`• ${insight}`);
          if (index < insights.length - 1) {
            doc.moveDown(0.3);
          }
        });
      } else {
        doc.fontSize(12).text('Sem insights disponíveis no momento.');
      }

      doc.moveDown();
      doc.fontSize(14).text('Gráfico NPS (aproximação textual)', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);

      const buckets = stats?.buckets ?? {};
      const total = buckets?.total ?? 0;
      const sections = [
        { label: 'Promotores', value: buckets?.promoters ?? 0 },
        { label: 'Neutros', value: buckets?.passives ?? 0 },
        { label: 'Detratores', value: buckets?.detractors ?? 0 }
      ];

      sections.forEach(({ label, value }) => {
        const bar = buildBar(value, total);
        const line = `${label}: ${bar} ${value} (${formatPercent(value, total)})`;
        doc.text(line.trim());
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
