import { XyoBoundWitness, XyoPayload } from '../../../core'
import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { WithArchive } from '../../WithArchive'
import { XyoArchivistArchivePayloadApi } from '../Payload'

export class XyoArchivistArchiveBlockApi<
  T extends XyoBoundWitness = XyoBoundWitness,
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>
> extends XyoArchivistArchivePayloadApi<T, C> {
  public payloads(hash: string): XyoApiSimple<XyoPayload> {
    return new XyoApiSimple<XyoPayload>({
      ...this.config,
      root: `${this.root}hash/${hash}/payloads/`,
    })
  }
}
