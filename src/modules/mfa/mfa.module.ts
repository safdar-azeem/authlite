import QRCode from 'qrcode';
import { TotpService } from './totp.service';
import { BackupService } from './backup.service';
import { EncryptionService } from './encryption.service';
import { EnrollmentResult, VerifyTotpOptions, BackupCodesResult } from '../../types';

export class MfaModule {
  private readonly totpService: TotpService;
  private readonly backupService: BackupService;
  private readonly encryptionService: EncryptionService;

  constructor(appName: string, encryptionKey: string) {
    this.totpService = new TotpService(appName);
    this.backupService = new BackupService();
    this.encryptionService = new EncryptionService(encryptionKey);
  }

  async createEnrollment(identifier: string): Promise<EnrollmentResult> {
    const secret = this.totpService.generateSecret();
    const uri = this.totpService.generateUri(identifier, secret);
    const encryptedSecret = this.encryptionService.encrypt(secret);
    const { plainCodes } = this.backupService.generate();
    const qrCode = await QRCode.toDataURL(uri);

    return {
      encryptedSecret,
      qrCode,
      backupCodes: plainCodes,
    };
  }

  verifyTotp(options: VerifyTotpOptions): boolean {
    const decryptedSecret = this.encryptionService.decrypt(options.secret);
    return this.totpService.verify(options.token, decryptedSecret);
  }

  verifyBackupCode(code: string, hashedCodes: string[]): number {
    return this.backupService.verify(code, hashedCodes);
  }

  generateBackupCodes(): BackupCodesResult {
    return this.backupService.generate();
  }

  decryptSecret(encryptedSecret: string): string {
    return this.encryptionService.decrypt(encryptedSecret);
  }

  encryptSecret(secret: string): string {
    return this.encryptionService.encrypt(secret);
  }
}
