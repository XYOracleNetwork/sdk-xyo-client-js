import Ajv from 'ajv'
import { JSONSchema4 } from 'json-schema'
import LRU from 'lru-cache'

import { XyoDomainConfigWrapper, XyoPayload } from '../core'
import { XyoSchemaPayload } from '../Witnesses'

const getSchemaNameFromSchema = (schema: JSONSchema4) => {
  if (schema.properties) {
    const pattern = schema.properties.schema.pattern
    if (pattern?.startsWith('/^') && pattern?.endsWith('$/')) {
      console.log(`getSchemaNameFromSchema: ${pattern.substring(2, pattern.length - 2)}`)
      return pattern.substring(2, pattern.length - 2)
    }
  }
  console.log('getSchemaNameFromSchema: undefined')
}

export class XyoSchemaCache {
  public proxy = 'https://api.archivist.xyo.network/domain'
  private cache = new LRU<string, XyoPayload | null>({ max: 500, ttl: 1000 * 60 * 5 })

  private cacheSchemaIfValid(schema: XyoSchemaPayload) {
    //only store them if they match the schema root
    if (schema.definition) {
      const ajv = new Ajv({ strict: false })
      //check if it is a valid schema def
      ajv.compile(schema.definition)
      const schemaName = getSchemaNameFromSchema(schema.definition)
      if (schemaName) {
        this.cache.set(schemaName, schema)
      }
    }
  }

  private cacheSchemas(aliases?: XyoPayload[] | null) {
    aliases
      ?.filter((alias) => alias.schema === 'network.xyo.schema')
      .forEach((alias) => {
        this.cacheSchemaIfValid(alias as XyoSchemaPayload)
      })
  }

  //Note: there is a race condition in here if two threads (or promises) start a get at the same time, they will both do the discovery
  public async get(schema: string) {
    const loadSchema = async (schema: string) => {
      const domain = await XyoDomainConfigWrapper.discover(schema, this.proxy)
      await domain?.fetch()
      this.cacheSchemas(domain?.aliases)

      //if it is still undefined, mark it as null (not found)
      if (this.cache.get(schema) === undefined) {
        this.cache.set(schema, null)
      }
    }

    //if we did not find it, mark it as not found (null)
    if (this.cache.get(schema) === undefined) {
      await loadSchema(schema)
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
