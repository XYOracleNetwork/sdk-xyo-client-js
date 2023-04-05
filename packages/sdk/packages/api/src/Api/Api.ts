import { AddressValue } from '@xyo-network/account'
import { XyoApiConfig } from '@xyo-network/api-models'
import { DataLike } from '@xyo-network/core'
import { Huri } from '@xyo-network/huri'
import { Payload } from '@xyo-network/payload-model'

import { XyoApiSimple } from '../Simple'
import { XyoUserApi } from '../User'
import { XyoAccountApi } from './Account'

export class XyoArchivistApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<Payload[], C> {
  private _user?: XyoUserApi

  get user(): XyoUserApi {
    this._user =
      this._user ??
      new XyoUserApi({
        ...this.config,
        root: `${this.root}user/`,
      })
    return this._user
  }

  account(address: DataLike) {
    return new XyoAccountApi({
      ...this.config,
      root: `${this.root}wallet/${new AddressValue(address).hex}/`,
    })
  }

  huri(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return new XyoApiSimple<Payload>({
      ...this.config,
      root: `${this.root}${huriObj.href}/`,
    })
  }
}
