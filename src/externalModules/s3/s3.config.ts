import * as config from 'config';

export function getAwsConfig() {
  return config.get('awsConfig');
}

export const S3_BUCKET: string = config.get('s3.bucket');
