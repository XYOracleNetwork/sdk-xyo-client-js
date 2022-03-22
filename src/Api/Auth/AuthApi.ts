import { XyoApiBase } from '../Base'

export class XyoAuthApi extends XyoApiBase {
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

  public async login(credentials: { email: string; password: string }) {
    return await this.postEndpoint<{ token: string }>('login/', {
      credentials,
    })
  }

  public async walletChallenge(address: string) {
    return await this.postEndpoint<{ state: string }>('wallet/challenge/', {
      address,
    })
  }

  async walletVerify(address: string, message: string, signature: string) {
    return await this.postEndpoint<{ token: string }>('wallet/verify/', {
      address,
      message,
      signature,
    })
  }

  public async profile() {
    return await this.getEndpoint<unknown[]>('profile/')
  }
}
