import crypto from 'crypto';
import { BACKUP_CODES_CONFIG } from '../../constants';

export class BackupService {
  generate(): { plainCodes: string[]; hashedCodes: string[] } {
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < BACKUP_CODES_CONFIG.COUNT; i++) {
      const code = this.generateCode();
      plainCodes.push(code);
      hashedCodes.push(this.hash(code));
    }

    return { plainCodes, hashedCodes };
  }

  verify(code: string, hashedCodes: string[]): number {
    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const hashedInput = this.hash(normalizedCode);
    return hashedCodes.findIndex((hashed) => hashed === hashedInput);
  }

  hash(code: string): string {
    return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
  }

  private generateCode(): string {
    let code = '';
    const charsetLength = BACKUP_CODES_CONFIG.CHARSET.length;

    for (let i = 0; i < BACKUP_CODES_CONFIG.LENGTH; i++) {
      const randomIndex = crypto.randomInt(0, charsetLength);
      code += BACKUP_CODES_CONFIG.CHARSET[randomIndex];
    }

    return code;
  }
}
