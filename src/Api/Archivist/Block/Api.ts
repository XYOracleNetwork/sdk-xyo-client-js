import { XyoBoundWitness, XyoPayload } from '../../../models'
import { XyoApiConfig } from '../../Config'
import { WithArchive } from '../../WithArchive'
import { XyoArchivistArchivePayloadApi } from '../Payload'

export class XyoArchivistArchiveBlockApi<
  T extends XyoBoundWitness = XyoBoundWitness,
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>
> extends XyoArchivistArchivePayloadApi<T, C> {
  public async getPayloadsByHash(hash: string) {
    return await this.getEndpoint<XyoPayload[][]>(`hash/${hash}/payloads`)
  }
}
