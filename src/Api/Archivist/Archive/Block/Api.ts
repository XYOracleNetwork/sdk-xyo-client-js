import { assertEx } from '@xylabs/sdk-js'

import { XyoBoundWitness, XyoPayload } from '../../../../models'
import { XyoArchivistApiBase } from '../../Base'

export class XyoArchivistArchiveBlockApi extends XyoArchivistApiBase {
  private buildPath(endPoint: string) {
    return `${this.config.apiDomain}/archive/${this.config.archive}/block/${endPoint}`
  }

  private async getPath<T>(endPoint: string) {
    return (await this.axios.get<T>(this.buildPath(endPoint), this.axiosRequestConfig)).data
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

  public async getStats() {
    return await this.getPath<{ count: number }>('/stats')
  }

  public async getByHash(hash: string) {
    return await this.getPath<XyoBoundWitness[]>(`/hash/${hash}`)
  }

  public async getPayloadsByHash(hash: string) {
    return await this.getPath<XyoPayload[]>(`/hash/${hash}/payloads`)
  }

  private async get(params: { order: 'desc' | 'asc'; timestamp: number }, limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getPath<XyoBoundWitness[]>('')
  }

  public async getBefore(timestamp: number, limit = 20) {
    return await this.get({ order: 'desc', timestamp }, limit)
  }

  public async getAfter(timestamp: number, limit = 20) {
    return await this.get({ order: 'asc', timestamp }, limit)
  }

  public async getMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getPath<XyoBoundWitness[]>(`/recent/${limit}`)
  }

  public async getSample(size: number) {
    return await this.getPath<XyoBoundWitness[]>(`/sample/${size}`)
  }
}
