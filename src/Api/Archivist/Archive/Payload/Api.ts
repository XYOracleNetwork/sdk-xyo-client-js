import { assertEx } from '@xylabs/sdk-js'

import { XyoPayload } from '../../../../models'
import { XyoArchivistApiBase } from '../../Base'

export class XyoArchivistArchivePayloadApi extends XyoArchivistApiBase {
  private buildPath(endPoint: string) {
    return `${this.config.apiDomain}/archive/${this.config.archive}/payload/${endPoint}`
  }

  private async getPath<T>(endPoint: string) {
    return (await this.axios.get<T>(this.buildPath(endPoint), this.axiosRequestConfig)).data
  }

  public async getStats() {
    return await this.getPath<{ count: number }>('/stats')
  }

  public async getByHash(hash: string) {
    return await this.getPath<XyoPayload[]>(`/hash/${hash}`)
  }

  public async repairByHash(hash: string) {
    return await this.getPath<XyoPayload[]>(`/hash/${hash}/repair`)
  }

  public async getMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getPath<XyoPayload[]>(`/recent/${limit}`)
  }

  public async getSample(size: number) {
    return await this.getPath<XyoPayload[]>(`/sample/${size}`)
  }
}
