import { assertEx } from '@xylabs/sdk-js'

import { XyoPayload } from '../../../../models'
import { XyoArchivistApiBase } from '../../Base'

export class XyoArchivistArchivePayloadApi<T = XyoPayload> extends XyoArchivistApiBase {
  protected buildPath(endPoint: string) {
    return `${this.config.apiDomain}/archive/${this.config.archive}/payload/${endPoint}`
  }

  protected async getPath<T>(endPoint: string) {
    return (await this.axios.get<T>(this.buildPath(endPoint), this.axiosRequestConfig)).data
  }

  public async getStats() {
    return await this.getPath<{ count: number }>('/stats')
  }

  public async getByHash(hash: string) {
    return await this.getPath<T[]>(`/hash/${hash}`)
  }

  public async repairByHash(hash: string) {
    return await this.getPath<T[]>(`/hash/${hash}/repair`)
  }

  private async get(params: { order: 'desc' | 'asc'; timestamp: number }, limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getPath<T[]>('')
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
    return await this.getPath<T[]>(`/recent/${limit}`)
  }

  public async getSample(size: number) {
    return await this.getPath<T[]>(`/sample/${size}`)
  }
}
