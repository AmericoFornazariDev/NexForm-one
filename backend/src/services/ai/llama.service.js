export async function generateReply(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  try {
    const { execSync } = await import('child_process');
    const output = execSync(`ollama run llama3 "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8'
    });
    return output.trim();
  } catch (error) {
    throw new Error(`Failed to generate reply with LLaMA: ${error.message}`);
  }
}
