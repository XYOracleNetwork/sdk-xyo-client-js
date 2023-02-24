import { XyoApiConfig } from '@xyo-network/api-models'
import { XyoPayloads } from '@xyo-network/payload-model'

import { XyoApiSimple } from '../../Simple'
import { XyoAddressApi } from './Address'

export class XyoAddressesApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<XyoPayloads, C> {
  /**
   * @deprecated Use module API
   */
  address(address: string): XyoAddressApi {
    return new XyoAddressApi({
      ...this.config,
      root: `${this.root}${address}/`,
    })
  }
}
