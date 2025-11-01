import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function generateReply(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  try {
    const { stdout } = await execFileAsync('ollama', ['run', 'llama3', prompt]);
    return stdout.trim();
  } catch (error) {
    const message = error?.message || 'Unknown error';
    throw new Error(`Failed to generate reply with LLaMA: ${message}`);
  }
}
