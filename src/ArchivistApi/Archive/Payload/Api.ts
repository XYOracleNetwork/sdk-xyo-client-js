import { assertEx } from '@xylabs/sdk-js'

import { XyoPayload } from '../../../models'
import { XyoArchivistApiBase } from '../../Base'

export class XyoArchivistArchivePayloadApi extends XyoArchivistApiBase {
  public async getStats() {
    return (
      await this.axios.get<{ count: number }>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/stats`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async getByHash(hash: string) {
    return (
      await this.axios.get<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/hash/${hash}`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async repairByHash(hash: string) {
    return (
      await this.axios.get<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/hash/${hash}/repair`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async getMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return (
      await this.axios.get<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/recent/${limit}`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async getSample(size: number) {
    return (
      await this.axios.get<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/sample/${size}`,
        this.axiosRequestConfig
      )
    ).data
  }
}
