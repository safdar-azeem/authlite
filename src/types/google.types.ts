export type DeviceType = 'web' | 'ios' | 'android';

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}

export interface GoogleVerifyOptions {
  token: string;
  deviceType: DeviceType;
}
