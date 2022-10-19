import { XyoBoundWitness } from '@xyo-network/boundwitness'

import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'
export interface ModuleDescription {
  address: string
  queries: string[]
}

export class XyoAddressApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<ModuleDescription[], C> {
  public address(address: string): XyoApiSimple<XyoBoundWitness[]> {
    return new XyoApiSimple<XyoBoundWitness[]>({
      ...this.config,
      root: `${this.root}address/${address}/`,
    })
  }
}
