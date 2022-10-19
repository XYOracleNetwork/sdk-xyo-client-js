import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoAddressApi } from './Address'
import { NodeModuleDescription } from './NodeModuleDescription'

export class XyoAddressesApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<NodeModuleDescription[], C> {
  public address(address: string): XyoAddressApi {
    return new XyoAddressApi({
      ...this.config,
      root: `${this.root}address/${address}/`,
    })
  }
}
