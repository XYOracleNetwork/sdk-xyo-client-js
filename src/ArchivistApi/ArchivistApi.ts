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
        `${this.config.apiDomain}/archive/${this.config.archive}/bw`,
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
      await axios.get<XyoBoundWitness>(`${this.config.apiDomain}/archive/${this.config.archive}/bw/${hash}`, {
        headers: this.headers,
      })
    ).data
  }

  public async getBoundWitnessSample(size: number) {
    return (
      await axios.get<XyoBoundWitness[]>(`${this.config.apiDomain}/archive/${this.config.archive}/bw/sample/${size}`, {
        headers: this.headers,
      })
    ).data
  }

  static get(config: XyoArchivistApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export default XyoArchivistApi
