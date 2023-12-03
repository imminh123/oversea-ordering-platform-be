import { Injectable } from '@nestjs/common';
import { MailType, getOauthConfig } from './mail.const';
import * as Mailjet from 'node-mailjet';
import { MailDto } from './mail.dto';
import * as path from 'path';
import * as fs from 'fs';
import handlebars from 'handlebars';
import { getConfig } from '../../shared/config/config.provider';
import { IAuthDocument } from '../authentication/authentication.interface';

@Injectable()
export class MailService {
  private readonly mailConfig;
  constructor() {
    this.mailConfig = getOauthConfig().mail;
  }

  async sendMail({ toMail, subject, body }: MailDto) {
    const mailjet = new Mailjet.Client({
      apiKey: this.mailConfig.apiKey,
      apiSecret: this.mailConfig.secretKey,
    });

    try {
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'thudan.td@gmail.com',
              Name: 'Oversea',
            },
            To: [
              {
                Email: toMail,
              },
            ],
            Subject: subject,
            HTMLPart: body,
          },
        ],
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: mail.service.ts:44 ~ MailService ~ sendMail ~ error:',
        error,
      );
    }
  }

  getTemplatePath(mailType: MailType) {
    const prefixPath = process.env.NODE_ENV !== 'test' ? '' : 'modules/mail/';

    switch (mailType) {
      case MailType.REGISTER:
        return path.resolve(__dirname, prefixPath, `templates/register.html`);
      case MailType.FORGOT_PASSWORD:
        return path.resolve(
          __dirname,
          prefixPath,
          `templates/forgot_password.html`,
        );
    }
  }

  getHTMLFile(path: string) {
    return fs.readFileSync(path, { encoding: 'utf-8' });
  }

  getHtmlTemplate(mailType: MailType, data) {
    const templatePath = this.getTemplatePath(mailType);
    const htmlContent = this.getHTMLFile(templatePath);
    const template = handlebars.compile(htmlContent);
    return template(data);
  }

  sendMailTemplate({ toMail, subject, mailType }, params) {
    const body = this.getHtmlTemplate(mailType, params);
    return this.sendMail({ toMail, subject, body });
  }

  async sendRequestActiveAccount(user: IAuthDocument) {
    const clientUrl = String(getConfig().get('client.host'));
    const params = {
      email: user.mail,
      registerLink: `${clientUrl}/register/${user.registerToken}`,
    };

    const options = {
      toMail: user.mail,
      subject: 'Request register account',
      mailType: MailType.REGISTER,
    };

    return this.sendMailTemplate(options, params);
  }

  async sendPurchaseSuccess(param: any, toMail: string) {
    const clientUrl = String(getConfig().get('client.host'));
    const address = `${param.address.address}, ${param.address.ward}, ${param.address.city}, ${param.address.province}`;
    const params = {
      ...param,
      orderDetailLink: `${clientUrl}/orders/${param.orderId}`,
      address,
    };

    const options = {
      toMail,
      subject: 'Thanh toán thành công',
      mailType: MailType.ORDER_SUCCESS,
    };

    return this.sendMailTemplate(options, params);
  }
}
