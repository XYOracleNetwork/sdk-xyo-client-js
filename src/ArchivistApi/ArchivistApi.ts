import axios from 'axios'

import { XyoBoundWitnessJson } from '../models'
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

  public async postBoundWitnesses(entries: XyoBoundWitnessJson[]) {
    return (
      await axios.post<number>(`${this.config.apiDomain}/archive/${this.config.archive}/bw`, entries, {
        headers: this.headers,
      })
    ).data
  }

  public async postBoundWitness(entry: XyoBoundWitnessJson) {
    return (
      await axios.post<number>(`${this.config.apiDomain}/archive/${this.config.archive}/bw`, entry, {
        headers: this.headers,
      })
    ).data
  }

  static get(config: XyoArchivistApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export default XyoArchivistApi
