import { XyoApiConfig } from '@xyo-network/api-models'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleDescription } from '@xyo-network/module-model'

import { XyoApiSimple } from '../../../Simple'

export class XyoAddressApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<ModuleDescription, C> {
  public get boundWitnesses(): XyoApiSimple<XyoBoundWitness[]> {
    return new XyoApiSimple({
      ...this.config,
      root: `${this.root}boundwitness/`,
    })
  }
}
