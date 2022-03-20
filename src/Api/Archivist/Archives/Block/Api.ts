import { XyoBoundWitness, XyoPayload } from '../../../../models'
import { WithArchive } from '../../../WithArchive'
import { XyoArchivistApiConfig } from '../../Config'
import { XyoArchivistArchivePayloadApi } from '../Payload'

export class XyoArchivistArchiveBlockApi<
  C extends WithArchive<XyoArchivistApiConfig> = WithArchive<XyoArchivistApiConfig>,
  T extends XyoBoundWitness = XyoBoundWitness
> extends XyoArchivistArchivePayloadApi<C, T> {
  constructor(config: C) {
    super(config)
  }

  public async post(block: T[] | T) {
    const blocks = Array.isArray(block) ? block : [block]
    return await this.postEndpoint<{ boundWitnesses: number; payloads: number }>('', {
      boundWitnesses: blocks,
    })
  }

  public async getPayloadsByHash(hash: string) {
    return await this.getEndpoint<XyoPayload[]>(`hash/${hash}/payloads`)
  }
}
