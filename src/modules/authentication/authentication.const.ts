import { getConfig } from '../config/config.provider';

export enum OAuthClient {
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

export const privateKey = getConfig().get('jwtPrivateKey');

export const fbApiUrl = getConfig().get('oauth.facebook.apiUrl');

export const getOauthConfig = () => {
  return {
    facebook: {
      clientId: getConfig().get('oauth.facebook.clientId'),
      clientSecret: getConfig().get('oauth.facebook.clientSecret'),
    },
    google: {
      clientId: getConfig().get('oauth.google.clientId'),
      clientSecret: getConfig().get('oauth.google.clientSecret'),
    },
  };
};

export enum Gender {
  NAM = 'nam',
  NU = 'nữ',
}
export const defaultPassword = '111111';
