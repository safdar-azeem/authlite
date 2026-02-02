export class AuthLiteError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'AUTHLITE_ERROR') {
    super(message);
    this.name = 'AuthLiteError';
    this.code = code;
    Object.setPrototypeOf(this, AuthLiteError.prototype);
  }
}

export class ConfigurationError extends AuthLiteError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class EncryptionError extends AuthLiteError {
  constructor(message: string) {
    super(message, 'ENCRYPTION_ERROR');
    this.name = 'EncryptionError';
    Object.setPrototypeOf(this, EncryptionError.prototype);
  }
}

export class VerificationError extends AuthLiteError {
  constructor(message: string) {
    super(message, 'VERIFICATION_ERROR');
    this.name = 'VerificationError';
    Object.setPrototypeOf(this, VerificationError.prototype);
  }
}

export class GoogleAuthError extends AuthLiteError {
  constructor(message: string) {
    super(message, 'GOOGLE_AUTH_ERROR');
    this.name = 'GoogleAuthError';
    Object.setPrototypeOf(this, GoogleAuthError.prototype);
  }
}
