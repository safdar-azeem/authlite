# AuthLite

Lightweight authentication library with 2FA (TOTP) and Google OAuth support for Node.js applications.

## Installation

```bash
yarn add authlite
# or
npm install authlite
```

## Quick Start

```typescript
import { AuthLite } from 'authlite';

const auth = new AuthLite({
  appName: 'MyApp',
  encryptionKey: process.env.MFA_ENCRYPTION_KEY!, // Must be exactly 32 characters
  google: {
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
  },
});
```

## Google OAuth

```typescript
const googleUser = await auth.google.verify(idToken, 'web'); // 'web' | 'ios' | 'android'

// Returns:
// {
//   email: string,
//   name: string,
//   picture: string,
//   googleId: string
// }
```

## MFA (Two-Factor Authentication)

### Enrollment

```typescript
const { encryptedSecret, qrCode, backupCodes } = await auth.mfa.createEnrollment(user.email);

// Save to database
user.mfaSecret = encryptedSecret;
user.mfaBackupCodes = backupCodes; // Hash these before storing
await user.save();

// Send qrCode (data URL) to frontend for display
```

### Verification

```typescript
const isValid = auth.mfa.verifyTotp({
  token: userInputCode,
  secret: user.mfaSecret, // Pass encrypted secret directly
});

if (!isValid) {
  throw new Error('Invalid code');
}
```

### Backup Codes

```typescript
// Generate backup codes
const { plainCodes, hashedCodes } = auth.mfa.generateBackupCodes();

// Store hashedCodes in database, show plainCodes to user once

// Verify a backup code
const codeIndex = auth.mfa.verifyBackupCode(userInputCode, user.hashedBackupCodes);
if (codeIndex !== -1) {
  // Valid - remove used code
  user.hashedBackupCodes.splice(codeIndex, 1);
  await user.save();
}
```

## Configuration

| Option                   | Type     | Required | Description                                    |
| ------------------------ | -------- | -------- | ---------------------------------------------- |
| `appName`                | `string` | Yes      | Application name (shown in authenticator apps) |
| `encryptionKey`          | `string` | Yes      | 32-character key for AES-256-GCM encryption    |
| `google.webClientId`     | `string` | No       | Google OAuth client ID for web                 |
| `google.iosClientId`     | `string` | No       | Google OAuth client ID for iOS                 |
| `google.androidClientId` | `string` | No       | Google OAuth client ID for Android             |

## Error Handling

```typescript
import {
  AuthLiteError,
  ConfigurationError,
  EncryptionError,
  VerificationError,
  GoogleAuthError,
} from 'authlite';

try {
  await auth.google.verify(token, 'web');
} catch (error) {
  if (error instanceof GoogleAuthError) {
    // Handle Google auth failure
  }
}
```

## Advanced Usage

### Access Individual Services

```typescript
import { MfaModule, TotpService, EncryptionService } from 'authlite';

// Create standalone services if needed
const encryption = new EncryptionService('your-32-character-key-here!!!');
const encrypted = encryption.encrypt('secret-data');
const decrypted = encryption.decrypt(encrypted);
```

### Constants

```typescript
import { TOTP_CONFIG, ENCRYPTION_CONFIG, BACKUP_CODES_CONFIG } from 'authlite';

console.log(TOTP_CONFIG.DIGITS); // 6
console.log(BACKUP_CODES_CONFIG.COUNT); // 10
```

## License

MIT
