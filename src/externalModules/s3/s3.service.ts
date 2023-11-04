/* istanbul ignore file */
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Promise } from 'bluebird';
import { Stream } from 'stream';
import { getConfig } from '../../modules/config/config.provider';
import { getAwsConfig, S3_BUCKET } from './s3.config';

const config = getConfig();
export const DEFAULT_EXPIRE_AWS_SIGNED_URL = Number(
  config.get('s3.expireObjectKey'),
);
export class UploadGetSignedUrlParams {
  key: string;
  content: Body;
  expires?: number;
  fileName?: string;
}
@Injectable()
export class S3Service {
  public uploadStream(key: string, fileName: string, contentType?: string) {
    const pass = new Stream.PassThrough();
    return {
      writeStream: pass,
      promise: this.getS3()
        .upload({
          Bucket: S3_BUCKET,
          Key: key,
          Body: pass,
          ContentDisposition: fileName ? `inline` : '',
          ContentType: contentType,
        })
        .promise(),
    };
  }

  public upload(
    body: any,
    key: string,
    fileName: string,
    contentType?: string,
  ) {
    return this.getS3()
      .upload({
        Bucket: S3_BUCKET,
        Key: key,
        Body: body,
        ContentDisposition: fileName ? `inline` : '',
        ContentType: contentType,
      })
      .promise()
      .catch((err) => {
        Logger.error(err);
      });
  }

  public getObjectSignedUrl(
    key: string,
    expires = DEFAULT_EXPIRE_AWS_SIGNED_URL,
    isThrowError = true,
  ): Promise<string> {
    return this.getS3()
      .getSignedUrlPromise('getObject', {
        Bucket: S3_BUCKET,
        Key: key,
        Expires: expires,
      })
      .then(
        (url) => url,
        (err) => {
          Logger.error(err, err.message);
          if (isThrowError) {
            throw err;
          }
        },
      );
  }

  public getObject(key: string): Promise<any> {
    return this.getS3()
      .getObject({ Bucket: S3_BUCKET, Key: key })
      .promise()
      .then(
        (url) => url,
        (err) => {
          Logger.error(err, err.message);
          if (err.statusCode === HttpStatus.NOT_FOUND) {
            throw new NotFoundException(`No report with this key`);
          }
          throw err;
        },
      );
  }

  public getObjectStream(key: string) {
    const stream = this.getS3()
      .getObject({ Bucket: S3_BUCKET, Key: key })
      .createReadStream();
    stream.on('error', (err) => {
      Logger.error(
        (err.message && `Get object from S3 key ${key} fail: ${err.message}`) ||
          'Unknown error',
      );
      throw new InternalServerErrorException(
        (err.message && `Get object from S3 key ${key} fail: ${err.message}`) ||
          'Unknown error',
      );
    });
    return stream;
  }

  public getObjectNoExpireUrl(key: string): string {
    return `https://${S3_BUCKET}.s3.${config.get(
      'awsConfig.region',
    )}.amazonaws.com/${key}`;
  }

  public async deleteObjects(bucket: string, list: string[]) {
    try {
      const Objects = list.map((x) => {
        return {
          Key: x,
        };
      });
      return await this.getS3().deleteObjects({
        Bucket: bucket,
        Delete: { Objects },
      });
    } catch (error) {
      Logger.error(JSON.stringify(error));
    }
  }

  private getS3() {
    if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test') {
      return new S3({
        s3ForcePathStyle: true,
        accessKeyId: 'S3RVER',
        secretAccessKey: 'S3RVER',
        endpoint: 'http://localhost:8000',
      });
    }
    return new S3(getAwsConfig());
  }
}
