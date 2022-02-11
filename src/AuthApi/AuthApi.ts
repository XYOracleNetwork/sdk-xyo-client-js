import axios from 'axios'

import { getArchivistApiResponseTransformer as getTransform } from '../ArchivistApi'
import { XyoAuthApiConfig } from './AuthApiConfig'

class XyoAuthApi {
  private config: XyoAuthApiConfig = {
    apiDomain: 'http://localhost:8080',
    authPrefix: 'user',
  }

  private constructor(config?: XyoAuthApiConfig) {
    Object.assign(this.config, config)
  }

  login(credentials: { email: string; password: string }) {
    return axios.post(this.apiRoute('/login'), credentials, { transformResponse: getTransform() })
  }

  walletChallenge(address: string) {
    return axios.post<{ state: string }>(
      this.apiRoute('/wallet/challenge/'),
      {
        address,
      },
      { transformResponse: getTransform() }
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
      { transformResponse: getTransform() }
    )
  }

  get profile() {
    return axios.get(this.apiRoute('/profile'), { transformResponse: getTransform() })
  }

  private apiRoute(route: string) {
    return `${this.config.apiDomain}/${this.config.authPrefix}${route}`
  }

  static get(config?: XyoAuthApiConfig) {
    return new XyoAuthApi(config)
  }
}

export { XyoAuthApi }
