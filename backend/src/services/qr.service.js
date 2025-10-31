import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const QR_CODES_DIR = path.join(PUBLIC_DIR, 'qrcodes');
const PUBLIC_BASE_URL = 'https://nexform.app';

const ensureQrDirectory = () => {
  if (!fs.existsSync(QR_CODES_DIR)) {
    fs.mkdirSync(QR_CODES_DIR, { recursive: true });
  }
};

const buildPublicUrl = (fileName) => `${PUBLIC_BASE_URL}/public/qrcodes/${fileName}`;

const buildFilePathFromUrl = (qrUrl) => {
  if (!qrUrl) {
    return null;
  }

  // Remove protocol and domain if the URL is absolute
  const pathFromUrl = qrUrl.replace(/^https?:\/\/[^/]+/, '');
  const sanitized = pathFromUrl.replace(/^\/+/, '');

  const relativeToPublic = sanitized.startsWith('public/')
    ? sanitized.slice('public/'.length)
    : sanitized;

  return path.join(PUBLIC_DIR, relativeToPublic);
};

export const generateQRCode = async (formId) => {
  ensureQrDirectory();

  const qrContent = `https://nexform.app/form/${formId}`;
  const fileName = `form_${formId}.png`;
  const filePath = path.join(QR_CODES_DIR, fileName);

  await QRCode.toFile(filePath, qrContent, {
    type: 'png',
    margin: 1,
    width: 256
  });

  return buildPublicUrl(fileName);
};

export const deleteQRCodeFile = (qrUrl) => {
  const filePath = buildFilePathFromUrl(qrUrl);

  if (!filePath) {
    return;
  }

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Failed to delete QR code file:', error);
    }
  }
};

export const QrService = {
  generateQRCode,
  deleteQRCodeFile
};
