import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import type { Promisable, PromisableArray } from '@xylabs/promise'
import { fulfilled } from '@xylabs/promise'
import { isString } from '@xylabs/typeof'
import { AbstractArchivist, StorageClassLabel } from '@xyo-network/archivist-abstract'
import type {
  ArchivistConfig,
  ArchivistInsertQuery,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
} from '@xyo-network/archivist-model'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { type AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import Cookies from 'js-cookie'

export const CookieArchivistConfigSchema = 'network.xyo.archivist.cookie.config' as const
export type CookieArchivistConfigSchema = typeof CookieArchivistConfigSchema

export type CookieArchivistConfig = ArchivistConfig<{
  domain?: string
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  schema: CookieArchivistConfigSchema
}>

export type CookieArchivistParams = ArchivistParams<AnyConfigSchema<CookieArchivistConfig>>

@creatableModule()
export class CookieArchivist<
  TParams extends CookieArchivistParams = CookieArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, CookieArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = CookieArchivistConfigSchema
  static override readonly labels = { ...super.labels, [StorageClassLabel]: 'disk' }

  get domain() {
    return this.config?.domain
  }

  get maxEntries() {
    // all browsers support at least 60 cookies
    return this.config?.maxEntries ?? 60
  }

  get maxEntrySize() {
    // all browsers support at least 4000 length per cookie
    return this.config?.maxEntrySize ?? 4000
  }

  get namespace() {
    return this.config?.namespace ?? 'xyoarch'
  }

  override get queries(): string[] {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ...super.queries,
    ]
  }

  protected override allHandler(): PromisableArray<WithStorageMeta<Payload>> {
    try {
      return Object.entries(Cookies.get())
        .filter(([key]) => key.startsWith(`${this.namespace}-`))
        .map(([, value]) => JSON.parse(value))
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  protected override clearHandler(): void | Promise<void> {
    try {
      for (const [key] of Object.entries(Cookies.get())) {
        if (key.startsWith(`${this.namespace}-`)) {
          Cookies.remove(key)
        }
      }
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    try {
      const payloads = await this.all()
      assertEx(payloads.length > 0, () => 'Nothing to commit')
      const settled = await Promise.allSettled(
        (
          Object.values((await this.parentArchivists()).commit ?? [])?.map(async (parent) => {
            const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
            const query = await this.bindQuery(queryPayload, payloads)
            return (await parent?.query(query[0], query[1]))?.[0]
          })
        ).filter(exists),
      )
      await this.clear()
      return settled.filter(fulfilled).map(result => result.value).filter(exists)
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    const payloadPairs = await PayloadBuilder.dataHashPairs(await this.get(hashes))
    const deletedPairs = (
      await Promise.all(
        payloadPairs.map<[WithStorageMeta<Payload>, Hash]>(([payload, hash]) => {
          Cookies.remove(hash)
          return [payload, hash]
        }),
      )
    ).filter(exists)
    return deletedPairs.map(([payload]) => payload)
  }

  protected override getHandler(hashes: Hash[]): Promisable<WithStorageMeta<Payload>[]> {
    return (
      hashes.map((hash) => {
        const cookieString = Cookies.get(this.keyFromHash(hash))
        return isString(cookieString) ? JSON.parse(cookieString) : undefined
      })
    ).filter(exists)
  }

  protected override insertHandler(payloads: WithStorageMeta<Payload>[]): WithStorageMeta<Payload>[] {
    try {
      const resultPayloads: WithStorageMeta<Payload>[] = payloads.map((payload) => {
        const value = JSON.stringify(payload)
        assertEx(value.length < this.maxEntrySize, () => `Payload too large [${payload._hash}, ${value.length}]`)
        Cookies.set(this.keyFromHash(payload._hash), value)
        Cookies.set(this.keyFromHash(payload._dataHash), value)
        return payload
      })
      return resultPayloads
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  private keyFromHash(hash: string) {
    return `${this.namespace}-${hash}`
  }
}
