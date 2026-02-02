import forge from 'node-forge';
import { ENCRYPTION_CONFIG, ERROR_MESSAGES } from '../../constants';
import { EncryptionError } from '../../core/errors';

export class EncryptionService {
  private readonly key: string;

  constructor(encryptionKey: string) {
    this.key = encryptionKey;
  }

  encrypt(data: string): string {
    try {
      const iv = forge.random.getBytesSync(ENCRYPTION_CONFIG.IV_SIZE);
      const cipher = forge.cipher.createCipher('AES-GCM', this.key);

      cipher.start({ iv, tagLength: ENCRYPTION_CONFIG.TAG_SIZE * 8 });
      cipher.update(forge.util.createBuffer(data, 'utf8'));
      cipher.finish();

      const encrypted = cipher.output.getBytes();
      const tag = cipher.mode.tag.getBytes();

      const ivHex = forge.util.bytesToHex(iv);
      const tagHex = forge.util.bytesToHex(tag);
      const contentHex = forge.util.bytesToHex(encrypted);

      return `${ivHex}${ENCRYPTION_CONFIG.SEPARATOR}${tagHex}${ENCRYPTION_CONFIG.SEPARATOR}${contentHex}`;
    } catch (error) {
      throw new EncryptionError(ERROR_MESSAGES.ENCRYPTION_FAILED);
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(ENCRYPTION_CONFIG.SEPARATOR);

      if (parts.length !== 3) {
        throw new EncryptionError(ERROR_MESSAGES.INVALID_ENCRYPTED_FORMAT);
      }

      const [ivHex, tagHex, contentHex] = parts;

      const iv = forge.util.hexToBytes(ivHex);
      const tag = forge.util.hexToBytes(tagHex);
      const content = forge.util.hexToBytes(contentHex);

      const decipher = forge.cipher.createDecipher('AES-GCM', this.key);

      decipher.start({
        iv,
        tag: forge.util.createBuffer(tag),
        tagLength: ENCRYPTION_CONFIG.TAG_SIZE * 8,
      });
      decipher.update(forge.util.createBuffer(content));

      const pass = decipher.finish();

      if (!pass) {
        throw new EncryptionError(ERROR_MESSAGES.DECRYPTION_FAILED);
      }

      return decipher.output.toString();
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error;
      }
      throw new EncryptionError(ERROR_MESSAGES.DECRYPTION_FAILED);
    }
  }
}
