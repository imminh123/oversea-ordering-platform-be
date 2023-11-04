import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { OAuthClient, fbApiUrl, getOauthConfig } from './authentication.const';
import { HttpService } from '@nestjs/axios';
import { OAuth2Client } from 'google-auth-library';
import { getParamString } from '../../shared/helpers';
import * as http from 'http';
import * as open from 'open';
import * as url from 'url';

const googleConfig = getOauthConfig().google;
const googleClient = new OAuth2Client(
  googleConfig.clientId,
  googleConfig.clientSecret,
  'http://localhost:3000/oauth2callback',
);
@Injectable()
export class OAuthService {
  constructor(private readonly httpClient: HttpService) {}
  async verifyIdToken(
    oauthClient: string,
    token: string,
    redirect_uri?: string,
  ) {
    switch (oauthClient) {
      case OAuthClient.GOOGLE:
        return this.GgVerifyUserToken(token, redirect_uri);
      case OAuthClient.FACEBOOK:
        return this.FbVerifyUserToken(token);
      default:
        throw new BadRequestException('OAuth client unknown');
    }
  }

  async getUserInfo(oauthClient: string, token: string) {
    switch (oauthClient) {
      case OAuthClient.GOOGLE:
        return this.GgGetTokenInfo(token);
      case OAuthClient.FACEBOOK:
        return this.FbGetUserInfo(token);
      default:
        throw new BadRequestException('OAuth client unknown');
    }
  }

  async FbGetAppToken() {
    const params: any = {};
    params.client_id = getOauthConfig().facebook.clientId;
    params.client_secret = getOauthConfig().facebook.clientSecret;
    params.grant_type = 'client_credentials';
    try {
      const response = await this.httpClient.axiosRef.get(
        `${fbApiUrl}oauth/access_token?${getParamString(params)}`,
      );
      return response.data.access_token;
    } catch (error) {
      throw new BadGatewayException(`Get facebook app token failed: ${error}`);
    }
  }

  async FbVerifyUserToken(token: string) {
    const params: any = {};
    params.input_token = token;
    params.access_token = await this.FbGetAppToken();
    try {
      const { data } = await this.httpClient.axiosRef.get(
        `${fbApiUrl}debug_token?${getParamString(params)}`,
      );
      return data.data.is_valid;
    } catch ({ response }) {
      if (response.data.error?.is_valid) {
        return response.data.error.is_valid;
      }
      throw new BadGatewayException(
        `Verify facebook user token failed: ${response.data.error}`,
      );
    }
  }

  async FbGetUserInfo(token: string) {
    const params: any = {};
    params.fields = ['id'];
    params.access_token = token;
    try {
      const { data } = await this.httpClient.axiosRef.get(
        `${fbApiUrl}me?${getParamString(params)}`,
      );
      return data;
    } catch (error) {
      throw new BadGatewayException(`Get facebook app token failed: ${error}`);
    }
  }

  async GgVerifyUserToken(token: string, redirect_uri?: string) {
    return new Promise((resolve) => {
      googleClient.getToken(
        { code: token, redirect_uri },
        async (err, accessToken) => {
          if (err) {
            Logger.error(err);
            return resolve(false);
          }
          return resolve(accessToken.id_token);
        },
      );
    });
  }

  async GgGetTokenInfo(token: string) {
    return googleClient.verifyIdToken({ idToken: token }).then((data) => {
      return {
        id: data.getUserId(),
      };
    });
  }

  async getAuthenticatedClient(): Promise<{
    code: string;
  }> {
    if (process.env.NODE_ENV === 'default') {
      return new Promise(async (resolve, reject) => {
        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = googleClient.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
          ],
        });
        let isTimeout = false;
        let isResolve = false;

        // Open an http server to accept the oauth callback. In this simple example, the
        // only request to our webserver is to /oauth2callback?code=<code>
        const server = http
          .createServer(async (req, res) => {
            try {
              setTimeout(() => {
                isTimeout = true;
                throw new BadGatewayException('Connection timeout');
              }, 100000);
              if (req.url.indexOf('/oauth2callback') > -1) {
                // acquire the code from the querystring, and close the web server.
                const qs = new url.URL(req.url, 'http://localhost:3000')
                  .searchParams;
                const code = qs.get('code');
                res.end(
                  'Authentication successful! Please return to the console.',
                );
                if (!isTimeout) {
                  isResolve = true;
                  server.close();
                  resolve({ code });
                }
              }
            } catch (e) {
              if (!isResolve) {
                server.close();
                resolve(e);
              }
            }
          })
          .listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            open(authorizeUrl, { wait: false }).then((cp) => {
              cp.unref();
            });
          });
      });
    }
  }
}
