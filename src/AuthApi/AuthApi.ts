import axios from 'axios'

import { AuthApiConfig } from './AuthApiConfig'

class AuthApi {
  private config: AuthApiConfig = {
    apiDomain: 'http://localhost:8080',
    authPrefix: 'user',
  }

  private constructor(config?: AuthApiConfig) {
    Object.assign(this.config, config)
  }

  login(credentials: { email: string; password: string }) {
    return axios.post(this.apiRoute('/login'), credentials)
  }

  walletChallenge(address: string) {
    return axios.post<{ state: string }>(this.apiRoute('/wallet/challenge/'), {
      address,
    })
  }

  walletVerify(address: string, message: string, signature: string) {
    return axios.post<{ token: string }>(this.apiRoute('/wallet/verify/'), {
      address,
      message,
      signature,
    })
  }

  get profile() {
    return axios.get(this.apiRoute('/profile'))
  }

  private apiRoute(route: string) {
    return `${this.config.apiDomain}/${this.config.authPrefix}${route}`
  }

  static get(config?: AuthApiConfig) {
    return new AuthApi(config)
  }
}

export { AuthApi }
