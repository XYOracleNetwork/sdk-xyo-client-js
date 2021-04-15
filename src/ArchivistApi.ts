import { ApiConfig } from '@xyo-network/sdk-xyo-js'
import axios from 'axios'

import { XyoEntryJson } from './models'

class XyoArchivistApi {
  private config: ApiConfig
  private constructor(config: ApiConfig) {
    this.config = config
  }

  public get authenticated() {
    return !!this.config.token
  }

  public get headers() {
    return this.authenticated ? { Authorization: this.config.token } : {}
  }

  public async postEntries(entries: XyoEntryJson[]) {
    return (
      await axios.post(`${this.config.apiDomain}/entry`, entries, {
        headers: this.headers,
      })
    ).data
  }

  public async postEntry(entry: XyoEntryJson) {
    return (
      await axios.post(`${this.config.apiDomain}/entry`, entry, {
        headers: this.headers,
      })
    ).data
  }

  static get(config: ApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export default XyoArchivistApi
