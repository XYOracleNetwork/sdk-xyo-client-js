import { XyoApiBase, XyoApiResponseTuple, XyoApiResponseType } from '../Base'

export interface WalletChallengeResponse {
  state: string
}

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

  public async walletChallenge(address: string): Promise<WalletChallengeResponse>
  public async walletChallenge(address: string, responseType?: 'body'): Promise<WalletChallengeResponse>
  public async walletChallenge(
    address: string,
    responseType?: 'tuple'
  ): Promise<XyoApiResponseTuple<WalletChallengeResponse>>
  public async walletChallenge(
    address: string,
    responseType?: XyoApiResponseType
  ): Promise<WalletChallengeResponse | XyoApiResponseTuple<WalletChallengeResponse>> {
    switch (responseType) {
      case 'tuple':
        return await this.postEndpoint<WalletChallengeResponse>(
          'wallet/challenge/',
          {
            address,
          },
          'tuple'
        )
      default:
        return await this.postEndpoint<WalletChallengeResponse>(
          'wallet/challenge/',
          {
            address,
          },
          'body'
        )
    }
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
