import { XyoDomainPayloadWrapper } from '@xyo-network/domain-payload-plugin'
import { FetchedPayload } from '@xyo-network/huri'
import { XyoSchemaPayload, XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'
import Ajv, { SchemaObject } from 'ajv'
import LRU from 'lru-cache'

import { Debounce } from '../Debounce'
import { XyoSchemaNameToValidatorMap } from './SchemaNameToValidatorMap'

const getSchemaNameFromSchema = (schema: SchemaObject) => {
  if (schema.$id) {
    return schema.$id
  }
}

export type XyoSchemaCacheEntry = FetchedPayload<XyoSchemaPayload>

export class XyoSchemaCache<T extends XyoSchemaNameToValidatorMap = XyoSchemaNameToValidatorMap> {
  private static _instance?: XyoSchemaCache

  public onSchemaCached?: (name: string, entry: XyoSchemaCacheEntry) => void
  public proxy?: string

  private _cache = new LRU<string, XyoSchemaCacheEntry | null>({ max: 500, ttl: 1000 * 60 * 5 })
  private _validators: T = {} as T

  //prevents double discovery
  private getDebounce = new Debounce()

  private constructor(proxy?: string) {
    this.proxy = proxy
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new XyoSchemaCache()
    }
    return this._instance
  }

  /**
   * A map of cached schema (by name) to payload validators for the schema. A schema
   * must be cached via `get('schema.name')` before it's validator can be used as
   * they are compiled dynamically at runtime upon retrieval.
   */
  public get validators(): T {
    return this._validators
  }

  public async get(schema?: string) {
    if (schema) {
      await this.getDebounce.one(schema, async () => {
        //if we did not find it, mark it as not found (null)
        if (this._cache.get(schema) === undefined) {
          await this.fetchSchema(schema)
        }
      })
      return this._cache.get(schema)
    }
  }

  private cacheSchemaIfValid(entry: XyoSchemaCacheEntry) {
    //only store them if they match the schema root
    if (entry.payload.definition) {
      const ajv = new Ajv({ strict: false })
      //check if it is a valid schema def
      const validator = ajv.compile(entry.payload.definition)
      const schemaName = getSchemaNameFromSchema(entry.payload.definition)
      if (schemaName) {
        this._cache.set(schemaName, entry)
        const key = schemaName as keyof T
        this._validators[key] = validator as unknown as T[keyof T]
        this.onSchemaCached?.(schemaName, entry)
      }
    }
  }

  private cacheSchemas(aliasEntries?: FetchedPayload[] | null) {
    aliasEntries
      ?.filter((entry) => entry.payload.schema === XyoSchemaSchema)
      .forEach((entry) => {
        this.cacheSchemaIfValid(entry as XyoSchemaCacheEntry)
      })
  }

  private async fetchSchema(schema: string) {
    const domain = await XyoDomainPayloadWrapper.discover(schema, this.proxy)
    await domain?.fetch()
    this.cacheSchemas(domain?.aliases)

    //if it is still undefined, mark it as null (not found)
    if (this._cache.get(schema) === undefined) {
      this._cache.set(schema, null)
    }
  }
}
