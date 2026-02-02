import * as OTPAuth from 'otpauth';
import { TOTP_CONFIG } from '../../constants';

export class TotpService {
  private readonly issuer: string;

  constructor(issuer: string) {
    this.issuer = issuer;
  }

  generateSecret(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  generateUri(identifier: string, secret: string): string {
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      label: identifier,
      algorithm: TOTP_CONFIG.ALGORITHM,
      digits: TOTP_CONFIG.DIGITS,
      period: TOTP_CONFIG.PERIOD,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    return totp.toString();
  }

  verify(token: string, secret: string): boolean {
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      algorithm: TOTP_CONFIG.ALGORITHM,
      digits: TOTP_CONFIG.DIGITS,
      period: TOTP_CONFIG.PERIOD,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }
}
