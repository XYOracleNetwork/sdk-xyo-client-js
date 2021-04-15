import { ApiConfig } from '@xyo-network/sdk-xyo-js'
import axios from 'axios'
import shajs from 'sha.js'

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

  static sortObject<T extends Record<string, any>>(obj: T) {
    const result: Record<string, any> = {} as Record<string, any>
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        result[key] = obj[key]
      })
    return result as T
  }

  static hash(entry: XyoEntryJson) {
    const sortedEntry = this.sortObject<XyoEntryJson>(entry)
    const stringObject = JSON.stringify(sortedEntry)
    return shajs('sha256').update(stringObject).digest('hex')
  }

  static get(config: ApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export default XyoArchivistApi
