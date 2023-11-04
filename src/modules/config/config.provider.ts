import { Provider } from '@nestjs/common';
import * as dotenv from 'dotenv';

export const CONFIG = 'ConfigProviderToken';
import * as config from 'config';

export const configProvider: Provider = {
  provide: CONFIG,
  useFactory: () => {
    dotenv.config();
    return import('config');
  },
};

export const getHost = () => {
  const hostname = config.get('server.hostname');
  if (hostname) {
    return `${hostname}`;
  }
  return `${config.get('server.host')}:${config.get('server.port')}`;
};

export const getConfig = () => {
  return config;
};
