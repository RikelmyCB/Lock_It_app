import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Chave de 32 bytes para AES-256
const IV_LENGTH = 16; // O GCM usa um IV de 16 bytes

/**
 * Criptografa um texto usando AES-256-GCM.
 * Armazena o IV e a tag de autenticação junto com o texto cifrado.
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Retorna iv:authTag:encrypted como uma única string codificada em hex
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Descriptografa um texto cifrado com AES-256-GCM.
 */
export function decrypt(hash) {
  try {
    const [ivHex, authTagHex, encryptedHex] = hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error("Falha ao descriptografar:", error);
    return null; // Retorna null ou lança um erro se a descriptografia falhar
  }
}