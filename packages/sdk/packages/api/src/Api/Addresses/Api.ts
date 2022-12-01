import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleDescription } from '@xyo-network/module'

import { XyoApiSimple } from '../../Simple'
import { XyoAddressApi } from './Address'

export class XyoAddressesApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<ModuleDescription, C> {
  public address(address: string): XyoAddressApi {
    return new XyoAddressApi({
      ...this.config,
      root: `${this.root}${address}/`,
    })
  }
}
