import { XyoBoundWitness, XyoPayload } from '@xyo-network/core'

import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { WithArchive } from '../../WithArchive'

export class XyoArchivistNodeApi<
  T extends XyoBoundWitness | XyoBoundWitness[] = XyoBoundWitness | XyoBoundWitness[],
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>
> extends XyoApiSimple<T, C> {
  public queryResult(id: string): XyoApiSimple<XyoPayload> {
    return new XyoApiSimple<XyoPayload>({
      ...this.config,
      root: `${this.root}query/${id}/`,
    })
  }
}
