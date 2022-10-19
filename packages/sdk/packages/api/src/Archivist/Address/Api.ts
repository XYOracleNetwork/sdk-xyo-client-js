import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'

export interface ModuleDescription {
  address: string
  queries: string[]
  url?: string
}

export class XyoAddressApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<ModuleDescription[], C> {
  public address(address: string): XyoApiSimple<ModuleDescription> {
    return new XyoApiSimple<ModuleDescription>({
      ...this.config,
      root: `${this.root}address/${address}/`,
    })
  }
}
