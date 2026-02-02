export const TOTP_CONFIG = {
  ALGORITHM: 'SHA1',
  DIGITS: 6,
  PERIOD: 30,
  ISSUER_DEFAULT: 'AuthLite',
} as const;

export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES-GCM',
  KEY_SIZE: 32,
  IV_SIZE: 16,
  TAG_SIZE: 16,
  SEPARATOR: ':',
} as const;

export const BACKUP_CODES_CONFIG = {
  COUNT: 10,
  LENGTH: 8,
  CHARSET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
} as const;

export const ERROR_MESSAGES = {
  MISSING_APP_NAME: 'appName is required in configuration',
  MISSING_ENCRYPTION_KEY: 'encryptionKey is required in configuration',
  INVALID_ENCRYPTION_KEY_LENGTH: `encryptionKey must be exactly ${ENCRYPTION_CONFIG.KEY_SIZE} characters`,
  MISSING_GOOGLE_CONFIG: 'Google configuration is required to use Google module',
  MISSING_CLIENT_ID: 'No client ID configured for the specified device type',
  INVALID_ENCRYPTED_FORMAT: 'Invalid encrypted data format. Expected "iv:tag:content"',
  DECRYPTION_FAILED: 'Failed to decrypt data',
  ENCRYPTION_FAILED: 'Failed to encrypt data',
  INVALID_TOTP_TOKEN: 'Invalid TOTP token',
  GOOGLE_VERIFICATION_FAILED: 'Google token verification failed',
  INVALID_BACKUP_CODE: 'Invalid backup code',
} as const;

export const DEVICE_TYPES = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
} as const;
