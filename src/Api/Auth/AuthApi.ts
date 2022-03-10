import axios, { AxiosRequestConfig } from 'axios'

import { getArchivistApiResponseTransformer } from '../Archivist'
import { XyoAuthApiConfig } from './AuthApiConfig'

class XyoAuthApi {
  private config: XyoAuthApiConfig = {
    apiDomain: 'http://localhost:8080',
    authPrefix: 'user',
  }

  private constructor(config?: XyoAuthApiConfig) {
    Object.assign(this.config, config)
  }

  private get axiosRequestConfig(): AxiosRequestConfig {
    return {
      headers: this.headers,
      transformResponse: getArchivistApiResponseTransformer(),
    }
  }

  public get authenticated() {
    return !!this.config.jwtToken
  }

  public get headers(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.config.jwtToken) {
      headers.Authorization = `Bearer ${this.config.jwtToken}`
    }
    return headers
  }

  login(credentials: { email: string; password: string }) {
    return axios.post(this.apiRoute('/login'), credentials, this.axiosRequestConfig)
  }

  walletChallenge(address: string) {
    return axios.post<{ state: string }>(
      this.apiRoute('/wallet/challenge/'),
      {
        address,
      },
      this.axiosRequestConfig
    )
  }

  walletVerify(address: string, message: string, signature: string) {
    return axios.post<{ token: string }>(
      this.apiRoute('/wallet/verify/'),
      {
        address,
        message,
        signature,
      },
      this.axiosRequestConfig
    )
  }

  get profile() {
    return axios.get(this.apiRoute('/profile'), this.axiosRequestConfig)
  }

  private apiRoute(route: string) {
    return `${this.config.apiDomain}/${this.config.authPrefix}${route}`
  }

  static get(config?: XyoAuthApiConfig) {
    return new XyoAuthApi(config)
  }
}

export { XyoAuthApi }
