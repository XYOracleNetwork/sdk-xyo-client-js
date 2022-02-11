import { assertEx } from '@xylabs/sdk-js'
import axios from 'axios'

import { XyoBoundWitness, XyoPayload } from '../models'
import { XyoArchivistApiConfig } from './ArchivistApiConfig'
import { getArchivistApiResponseTransformer } from './ArchivistApiResponseTransformer'

class XyoArchivistApi {
  private config: XyoArchivistApiConfig
  private constructor(config: XyoArchivistApiConfig) {
    this.config = config
  }

  public get archive() {
    return this.config.archive
  }

  public get authenticated() {
    return !!this.config.apiKey || !!this.config.jwtToken || !!this.config.token
  }

  public get headers(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.config.token) {
      headers.Authorization = this.config.token
    }
    if (this.config.jwtToken) {
      headers.Authorization = `Bearer ${this.config.jwtToken}`
    }
    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey
    }
    return headers
  }

  public async getArchives() {
    return (
      await axios.get<Array<string>>(`${this.config.apiDomain}/archive`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async putArchive(archive: string) {
    return (
      await axios['put']<{ archive: string; owner: string }>(`${this.config.apiDomain}/archive/${archive}`, null, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async getArchiveKeys() {
    return (
      await axios.get<
        {
          created: string
          key: string
        }[]
      >(`${this.config.apiDomain}/archive/${this.config.archive}/settings/keys`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async postArchiveKey() {
    return (
      await axios['post']<{ created: string; key: string }>(
        `${this.config.apiDomain}/archive/${this.config.archive}/settings/keys`,
        null,
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async postBoundWitnesses(boundWitnesses: XyoBoundWitness[]) {
    return (
      await axios['post']<{ boundWitnesses: number; payloads: number }>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block`,
        { boundWitnesses },
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async postBoundWitness(entry: XyoBoundWitness) {
    return await this.postBoundWitnesses([entry])
  }

  public async getBoundWitnessStats() {
    return (
      await axios.get<{ count: number }>(`${this.config.apiDomain}/archive/${this.config.archive}/block/stats`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async getBoundWitnessByHash(hash: string) {
    return (
      await axios.get<XyoBoundWitness[]>(`${this.config.apiDomain}/archive/${this.config.archive}/block/hash/${hash}`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async getBoundWitnessPayloadsByHash(hash: string) {
    return (
      await axios.get<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/hash/${hash}/payloads`,
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async getPayloadStats() {
    return (
      await axios['get']<{ count: number }>(`${this.config.apiDomain}/archive/${this.config.archive}/payload/stats`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async getPayloadByHash(hash: string) {
    return (
      await axios['get']<XyoPayload[]>(`${this.config.apiDomain}/archive/${this.config.archive}/payload/hash/${hash}`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  public async repairPayloadByHash(hash: string) {
    return (
      await axios['get']<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/hash/${hash}/repair`,
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async getBoundWitnessMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max size = 100')
    return (
      await axios['get']<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/recent/${limit}`,
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async getPayloadsMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max size = 100')
    return (
      await axios['get']<XyoPayload[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/payload/recent/${limit}`,
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async getBoundWitnessSample(size: number) {
    return (
      await axios['get']<XyoBoundWitness[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/block/sample/${size}`,
        {
          headers: this.headers,
          transformResponse: getArchivistApiResponseTransformer(),
        }
      )
    ).data
  }

  public async getPayloadSample(size: number) {
    return (
      await axios.get<XyoPayload[]>(`${this.config.apiDomain}/archive/${this.config.archive}/payload/sample/${size}`, {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      })
    ).data
  }

  static get(config: XyoArchivistApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export { XyoArchivistApi }
