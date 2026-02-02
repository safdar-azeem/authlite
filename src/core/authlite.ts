import { MfaModule } from '../modules/mfa';
import { GoogleModule } from '../modules/google';
import { AuthLiteConfig } from '../types';
import { ConfigurationError } from './errors';
import { ERROR_MESSAGES, ENCRYPTION_CONFIG } from '../constants';

export class AuthLite {
  private readonly config: AuthLiteConfig;
  private _mfa: MfaModule | null = null;
  private _google: GoogleModule | null = null;

  constructor(config: AuthLiteConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  private validateConfig(config: AuthLiteConfig): void {
    if (!config.appName || config.appName.trim() === '') {
      throw new ConfigurationError(ERROR_MESSAGES.MISSING_APP_NAME);
    }

    if (!config.encryptionKey) {
      throw new ConfigurationError(ERROR_MESSAGES.MISSING_ENCRYPTION_KEY);
    }

    if (config.encryptionKey.length !== ENCRYPTION_CONFIG.KEY_SIZE) {
      throw new ConfigurationError(ERROR_MESSAGES.INVALID_ENCRYPTION_KEY_LENGTH);
    }
  }

  get mfa(): MfaModule {
    if (!this._mfa) {
      this._mfa = new MfaModule(this.config.appName, this.config.encryptionKey);
    }
    return this._mfa;
  }

  get google(): GoogleModule {
    if (!this._google) {
      if (!this.config.google) {
        throw new ConfigurationError(ERROR_MESSAGES.MISSING_GOOGLE_CONFIG);
      }
      this._google = new GoogleModule(this.config.google);
    }
    return this._google;
  }

  get appName(): string {
    return this.config.appName;
  }

  hasGoogleConfig(): boolean {
    return !!this.config.google;
  }
}
