import { XyoApiConfig } from '@xyo-network/api-models'
import { Huri } from '@xyo-network/huri'
import { Payload } from '@xyo-network/payload-model'

import { XyoApiSimple } from '../Simple'

export class XyoArchivistApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<Payload[], C> {
  huri(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return new XyoApiSimple<Payload>({
      ...this.config,
      root: `${this.root}${huriObj.href}/`,
    })
  }
}
