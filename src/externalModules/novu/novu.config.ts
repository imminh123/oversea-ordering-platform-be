import * as config from 'config';

export function getNovuConfig() {
  return config.get('awsConfig');
}
