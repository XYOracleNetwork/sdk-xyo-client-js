import LRU from 'lru-cache'

import { XyoDomainConfigWrapper } from '../DomainConfig'
import { XyoPayload } from '../Payload'

export class XyoSchemaCache {
  private cache = new LRU<string, XyoPayload | null>({ max: 500, ttl: 1000 * 60 * 5 })

  public async get(schema: string) {
    if (this.cache.get(schema) === undefined) {
      const domain = await XyoDomainConfigWrapper.discover(schema)
      await domain?.fetch()
      const definitions = domain?.definitions
      if (definitions) {
        definitions.forEach((definition) => {
          //only store them if they match the schema root
          if (definition.schema.startsWith(schema)) {
            this.cache.set(definition.schema, definition)
          }
        })
      }
      //if it is still undefined, make it as null (not found)
      if (this.cache.get(schema) === undefined) {
        this.cache.set(schema, null)
      }
    }
    return this.cache.get(schema)
  }

  private static _instance?: XyoSchemaCache
  static get instance() {
    if (!this._instance) {
      this._instance = new XyoSchemaCache()
    }
    return this._instance
  }
}
