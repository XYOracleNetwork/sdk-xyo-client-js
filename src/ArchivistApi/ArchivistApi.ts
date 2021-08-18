import { assertEx } from '@xyo-network/sdk-xyo-js'
import axios from 'axios'

import { XyoBoundWitness } from '../models'
import XyoArchivistApiConfig from './ArchivistApiConfig'

class XyoArchivistApi {
  private config: XyoArchivistApiConfig
  private constructor(config: XyoArchivistApiConfig) {
    this.config = config
  }

  public get authenticated() {
    return !!this.config.token
  }

  public get headers() {
    return this.authenticated ? { Authorization: this.config.token } : {}
  }

  public async postBoundWitnesses(boundWitnesses: XyoBoundWitness[]) {
    return (
      await axios.post<{ boundWitnesses?: number; payloads?: number }>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block`,
        { boundWitnesses },
        {
          headers: this.headers,
        }
      )
    ).data
  }

  public async postBoundWitness(entry: XyoBoundWitness) {
    return await this.postBoundWitnesses([entry])
  }

  public async getBoundWitnessByHash(hash: string) {
    return (
      await axios.get<XyoBoundWitness[]>(`${this.config.apiDomain}/archive/${this.config.archive}/block/hash/${hash}`, {
        headers: this.headers,
      })
    ).data
  }

  public async getBoundWitnessMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max size = 100')
    return (
      await axios.get<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/recent/${limit}`,
        {
          headers: this.headers,
        }
      )
    ).data
  }

  public async getBoundWitnessSample(size: number) {
    return (
      await axios.get<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/sample/${size}`,
        {
          headers: this.headers,
        }
      )
    ).data
  }

  static get(config: XyoArchivistApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export default XyoArchivistApi
