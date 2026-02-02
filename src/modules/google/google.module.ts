import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GoogleConfig, DeviceType, GoogleUser } from '../../types';
import { GoogleAuthError } from '../../core/errors';
import { ERROR_MESSAGES, DEVICE_TYPES } from '../../constants';

export class GoogleModule {
  private readonly config: GoogleConfig;
  private readonly clients: Map<DeviceType, OAuth2Client>;

  constructor(config: GoogleConfig) {
    this.config = config;
    this.clients = new Map();
    this.initializeClients();
  }

  private initializeClients(): void {
    if (this.config.webClientId) {
      this.clients.set(DEVICE_TYPES.WEB, new OAuth2Client(this.config.webClientId));
    }
    if (this.config.iosClientId) {
      this.clients.set(DEVICE_TYPES.IOS, new OAuth2Client(this.config.iosClientId));
    }
    if (this.config.androidClientId) {
      this.clients.set(DEVICE_TYPES.ANDROID, new OAuth2Client(this.config.androidClientId));
    }
  }

  async verify(token: string, deviceType: DeviceType): Promise<GoogleUser> {
    const client = this.clients.get(deviceType);

    if (!client) {
      throw new GoogleAuthError(ERROR_MESSAGES.MISSING_CLIENT_ID);
    }

    try {
      const audience = this.getAudience(deviceType);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new GoogleAuthError(ERROR_MESSAGES.GOOGLE_VERIFICATION_FAILED);
      }

      return this.mapPayloadToUser(payload);
    } catch (error) {
      if (error instanceof GoogleAuthError) {
        throw error;
      }
      throw new GoogleAuthError(
        error instanceof Error ? error.message : ERROR_MESSAGES.GOOGLE_VERIFICATION_FAILED
      );
    }
  }

  private getAudience(deviceType: DeviceType): string | undefined {
    switch (deviceType) {
      case DEVICE_TYPES.WEB:
        return this.config.webClientId;
      case DEVICE_TYPES.IOS:
        return this.config.iosClientId;
      case DEVICE_TYPES.ANDROID:
        return this.config.androidClientId;
      default:
        return undefined;
    }
  }

  private mapPayloadToUser(payload: TokenPayload): GoogleUser {
    return {
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture || '',
      googleId: payload.sub,
    };
  }
}
