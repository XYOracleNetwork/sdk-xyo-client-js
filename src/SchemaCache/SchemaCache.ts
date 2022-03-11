import LRU from 'lru-cache'

import { XyoDomainConfigWrapper } from '../DomainConfig'
import { Huri } from '../Huri'
import { XyoPayload } from '../models'

export type FindByHashFunction = (hash: Huri) => Promise<XyoPayload | undefined>

export class SchemaCache {
  private cache = new LRU<string, XyoPayload | null>({ max: 500, ttl: 1000 * 60 * 5 })

  private constructor() {
    return
  }

  public async get(schema: string, findByHash: FindByHashFunction) {
    if (this.cache.get(schema) === undefined) {
      const config = new XyoDomainConfigWrapper()

      const schemaHuri = (await config.discover(schema))?.schema?.[schema]
      if (schemaHuri) {
        const huri = new Huri(schemaHuri)
        const payload = (await findByHash(huri)) as XyoPayload
        this.cache.set(schema, payload ?? null)
      }
    }
    return this.cache.get(schema)
  }

  private static instance?: SchemaCache
  static get() {
    if (!this.instance) {
      this.instance = new SchemaCache()
    }
    return this.instance
  }
}
