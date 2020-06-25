import assert from 'assert';

import type { AuthData } from './types';
import client from './httpClient';

interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // seconds,
  refresh_token: string;
}

class AuthApi {
  async getToken({
    username,
    password,
    apiKey,
    apiSecret,
  }: {
    username: string;
    password: string;
    apiKey: string;
    apiSecret: string;
  }) {
    assert(username, 'username is required for request');
    assert(password, 'password is required for request');
    assert(apiKey, 'apiKey is required for request');
    assert(apiSecret, 'apiSecret is required for request');

    const redirectUrl = 'http://0.0.0.0';
    await this.collectAuthCookies({
      redirectUrl,
      apiKey,
    });

    const code = await this.getAuthorizeCode({
      username,
      password,
      redirectUrl,
      apiKey,
    });

    const token = await this.requestToken({
      code,
      apiKey,
      apiSecret,
      redirectUrl,
    });

    return token;
  }

  private async collectAuthCookies({
    redirectUrl,
    apiKey,
  }: {
    redirectUrl: string;
    apiKey: string;
  }): Promise<void> {
    await client.get('oauth2/authorize', {
      responseType: 'text',
      searchParams: {
        response_type: 'code',
        client_id: apiKey,
        redirect_uri: redirectUrl,
      },
    });
  }

  private async getAuthorizeCode({
    username,
    password,
    redirectUrl,
    apiKey,
  }: {
    username: string;
    password: string;
    redirectUrl: string;
    apiKey: string;
  }): Promise<string> {
    const {
      headers: { location: urlWithCode },
    } = await client.post('oauth2/authorize', {
      responseType: 'text',
      searchParams: {
        response_type: 'code',
        client_id: apiKey,
        redirect_uri: redirectUrl,
      },
      form: {
        username: username,
        password: password,
        auth_type_password: 'Sign in',
      },
      followRedirect: false,
    });

    const query = new URLSearchParams(String(urlWithCode).split('?')[1]);

    const code = query.get('code');

    if (!code) {
      throw new Error('Can not get auth code');
    }

    return code;
  }

  private async requestToken({
    code,
    redirectUrl,
    apiKey,
    apiSecret,
  }: {
    code: string;
    redirectUrl: string;
    apiKey: string;
    apiSecret: string;
  }): Promise<AuthData> {
    const {
      body: {
        access_token: accessToken,
        token_type: tokenType,
        refresh_token: refreshToken,
        expires_in: expiresIn,
      },
    } = await client.post<TokenResponse>('oauth2/token', {
      form: {
        grant_type: 'authorization_code',
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
        redirect_uri: redirectUrl,
      },
    });

    return {
      tokenType,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}

export default new AuthApi();
