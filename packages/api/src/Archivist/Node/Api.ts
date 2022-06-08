import { XyoBoundWitness, XyoPayload } from '@xyo-network/core'

import { XyoApiConfig } from '../../models'
import { XyoApiSimple, XyoApiSimpleQuery } from '../../Simple'
import { WithArchive } from '../../WithArchive'

export class XyoArchivistNodeApi<
  D extends XyoBoundWitness | XyoBoundWitness[] = XyoBoundWitness | XyoBoundWitness[],
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>
> extends XyoApiSimple<string[][], D, XyoApiSimpleQuery, C> {
  public queryResult(id: string): XyoApiSimple<XyoPayload> {
    return new XyoApiSimple<XyoPayload>({
      ...this.config,
      root: `${this.root}query/${id}/`,
    })
  }
}
