import { XyoApiBase } from '../Base'
import { XyoApiSimple } from '../Simple'

export interface XyoUserLogin {
  /** @field Email address of the user [in] */
  email?: string
  /** @field Password of the user [in] */
  password?: string
  /** @field Token to access the API as that user [out] */
  token?: string
}

export class XyoUserApi extends XyoApiBase {
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

  public login() {
    return new XyoApiSimple<XyoUserLogin>({
      ...this.config,
      root: `${this.root}login/`,
    })
  }

  public profile() {
    return new XyoApiSimple({
      ...this.config,
      root: `${this.root}profile/`,
    })
  }
}
