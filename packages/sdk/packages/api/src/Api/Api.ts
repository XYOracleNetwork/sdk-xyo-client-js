import { ApiConfig } from '@xyo-network/api-models'
import { Huri } from '@xyo-network/huri'
import { Payload } from '@xyo-network/payload-model'

import { ApiSimple } from '../Simple'

export class ArchivistApi<C extends ApiConfig = ApiConfig> extends ApiSimple<Payload[], C> {
  huri(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return new ApiSimple<Payload>({
      ...this.config,
      root: `${this.root}${huriObj.href}/`,
    })
  }
}
