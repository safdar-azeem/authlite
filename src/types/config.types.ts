export interface GoogleConfig {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
}

export interface AuthLiteConfig {
  appName: string;
  encryptionKey: string;
  google?: GoogleConfig;
}
