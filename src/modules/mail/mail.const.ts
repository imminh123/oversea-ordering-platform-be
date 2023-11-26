import { getConfig } from '../../shared/config/config.provider';

export const getOauthConfig = () => {
  return {
    mail: {
      apiKey: getConfig().get('mail.apiKey'),
      secretKey: getConfig().get('mail.secretKey'),
    },
  };
};

export enum MailType {
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password',
}
