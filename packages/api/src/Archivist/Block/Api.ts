import { XyoBoundWitness, XyoPayload } from '@xyo-network/core'

import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { WithArchive } from '../../WithArchive'
import { XyoArchivistPayloadApi } from '../Payload'

export class XyoArchivistArchiveBlockApi<
  T extends XyoBoundWitness = XyoBoundWitness,
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>
> extends XyoArchivistPayloadApi<T, C> {
  public payloads(hash: string): XyoApiSimple<XyoPayload[][]> {
    return new XyoApiSimple<XyoPayload[][]>({
      ...this.config,
      root: `${this.root}hash/${hash}/payloads/`,
    })
  }
}
