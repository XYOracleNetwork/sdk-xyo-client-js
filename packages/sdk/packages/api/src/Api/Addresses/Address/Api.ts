import { XyoApiConfig } from '@xyo-network/api-models'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { ModuleDescription } from '@xyo-network/module'

import { XyoApiSimple } from '../../../Simple'

export class XyoAddressApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<ModuleDescription, C> {
  public get boundWitnesses(): XyoApiSimple<XyoBoundWitness[]> {
    return new XyoApiSimple({
      ...this.config,
      root: `${this.root}boundwitness/`,
    })
  }
}
