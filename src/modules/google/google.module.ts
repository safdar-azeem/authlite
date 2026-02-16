import { OAuth2Client, TokenPayload, GenerateAuthUrlOpts, Credentials } from 'google-auth-library';
import { GoogleConfig, DeviceType, GoogleUser } from '../../types';
import { GoogleAuthError } from '../../core/errors';
import { ERROR_MESSAGES, DEVICE_TYPES } from '../../constants';

export class GoogleModule {
  private readonly config: GoogleConfig;
  private readonly deviceClients: Map<DeviceType, number>;

  constructor(config: GoogleConfig) {
    this.config = config;
    this.deviceClients = new Map();
    this.validateClients();
  }

  private validateClients(): void {
    if (this.config.webClientId) {
      this.deviceClients.set(DEVICE_TYPES.WEB, 1);
    }
    if (this.config.iosClientId) {
      this.deviceClients.set(DEVICE_TYPES.IOS, 1);
    }
    if (this.config.androidClientId) {
      this.deviceClients.set(DEVICE_TYPES.ANDROID, 1);
    }
  }

  private createClient(deviceType: DeviceType): OAuth2Client {
    const baseOptions = {
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
    };

    let clientId: string | undefined;

    switch (deviceType) {
      case DEVICE_TYPES.WEB:
        clientId = this.config.webClientId;
        break;
      case DEVICE_TYPES.IOS:
        clientId = this.config.iosClientId;
        break;
      case DEVICE_TYPES.ANDROID:
        clientId = this.config.androidClientId;
        break;
    }

    if (!clientId) {
      throw new GoogleAuthError(ERROR_MESSAGES.MISSING_CLIENT_ID);
    }

    return new OAuth2Client({
      ...baseOptions,
      clientId,
    });
  }

  generateAuthUrl(deviceType: DeviceType, opts?: GenerateAuthUrlOpts): string {
    if (!this.deviceClients.has(deviceType)) {
      throw new GoogleAuthError(ERROR_MESSAGES.MISSING_CLIENT_ID);
    }
    const client = this.createClient(deviceType);
    return client.generateAuthUrl(opts);
  }

  async getToken(code: string, deviceType: DeviceType): Promise<{ tokens: Credentials; res: any }> {
    if (!this.deviceClients.has(deviceType)) {
      throw new GoogleAuthError(ERROR_MESSAGES.MISSING_CLIENT_ID);
    }
    const client = this.createClient(deviceType);
    try {
      return await client.getToken(code);
    } catch (error) {
      if (error instanceof GoogleAuthError) {
        throw error;
      }
      throw new GoogleAuthError(error instanceof Error ? error.message : 'Failed to get token');
    }
  }

  async verify(token: string, deviceType: DeviceType): Promise<GoogleUser> {
    if (!this.deviceClients.has(deviceType)) {
      throw new GoogleAuthError(ERROR_MESSAGES.MISSING_CLIENT_ID);
    }

    const client = this.createClient(deviceType);

    try {
      if (deviceType === DEVICE_TYPES.WEB) {
        // For WEB, verify via userinfo endpoint using access token
        // We set credentials on this specific client instance (thread-safe as it's local to request)
        client.setCredentials({ access_token: token });

        const response = await client.request<any>({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });

        return {
          email: response.data.email,
          name: response.data.name,
          picture: response.data.picture,
          googleId: response.data.sub,
        };
      }

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
