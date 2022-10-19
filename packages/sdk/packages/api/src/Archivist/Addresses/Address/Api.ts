import { XyoApiConfig } from '../../../models'
import { XyoApiSimple } from '../../../Simple'
import { ModuleDescription } from '../ModuleDescription'

export class XyoAddressApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<ModuleDescription, C> {
  public address(address: string): XyoAddressApi {
    return new XyoAddressApi({
      ...this.config,
      root: `${this.root}address/${address}/`,
    })
  }
}
