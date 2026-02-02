export interface EnrollmentResult {
  encryptedSecret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface VerifyTotpOptions {
  token: string;
  secret: string;
}

export interface BackupCodesResult {
  plainCodes: string[];
  hashedCodes: string[];
}
