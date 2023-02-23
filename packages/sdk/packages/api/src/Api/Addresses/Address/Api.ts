import { XyoApiConfig } from '@xyo-network/api-models'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoApiSimple } from '../../../Simple'

export class XyoAddressApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<XyoPayload[], C> {
  /**
   * @deprecated Use module API
   */
  public get boundWitnesses(): XyoApiSimple<XyoBoundWitness[]> {
    return new XyoApiSimple({
      ...this.config,
      root: `${this.root}boundwitness/`,
    })
  }
}
