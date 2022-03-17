import { XyoBoundWitness, XyoPayload } from '../../../../models'
import { XyoArchivistArchivePayloadApi } from '../Payload'

export class XyoArchivistArchiveBlockApi extends XyoArchivistArchivePayloadApi<XyoBoundWitness> {
  protected buildPath(endPoint: string) {
    return `${this.config.apiDomain}/archive/${this.config.archive}/block/${endPoint}`
  }

  public async post(block: XyoBoundWitness[] | XyoBoundWitness) {
    const blocks = Array.isArray(block) ? block : [block]
    return (
      await this.axios.post<{ boundWitnesses: number; payloads: number }>(
        this.buildPath(''),
        { boundWitnesses: blocks },
        this.axiosRequestConfig
      )
    ).data
  }

  public async getPayloadsByHash(hash: string) {
    return await this.getPath<XyoPayload[]>(`/hash/${hash}/payloads`)
  }
}
