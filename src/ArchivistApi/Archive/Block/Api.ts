import { assertEx } from '@xylabs/sdk-js'

import { XyoBoundWitness } from '../../../models'
import { XyoArchivistApiBase } from '../../Base'

export class XyoArchivistArchiveBlockApi extends XyoArchivistApiBase {
  public async post(block: XyoBoundWitness[] | XyoBoundWitness) {
    const blocks = Array.isArray(block) ? block : [block]
    return (
      await this.axios.post<{ boundWitnesses: number; payloads: number }>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block`,
        { boundWitnesses: blocks },
        this.axiosRequestConfig
      )
    ).data
  }

  public async getStats() {
    return (
      await this.axios.get<{ count: number }>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/stats`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async getByHash(hash: string) {
    return (
      await this.axios.get<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/hash/${hash}`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async getBefore(timestamp: number, limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    const params = { order: 'desc', timestamp }
    return (
      await this.axios.get<XyoBoundWitness[]>(`${this.config.apiDomain}/archive/${this.config.archive}/block`, {
        ...this.axiosRequestConfig,
        params,
      })
    ).data
  }

  public async getAfter(timestamp: number, limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    const params = { order: 'asc', timestamp }
    return (
      await this.axios.get<XyoBoundWitness[]>(`${this.config.apiDomain}/archive/${this.config.archive}/block`, {
        ...this.axiosRequestConfig,
        params,
      })
    ).data
  }

  public async getMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return (
      await this.axios.get<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/recent/${limit}`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async getSample(size: number) {
    return (
      await this.axios.get<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/sample/${size}`,
        this.axiosRequestConfig
      )
    ).data
  }
}
