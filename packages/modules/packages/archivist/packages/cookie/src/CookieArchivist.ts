import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import type { Promisable, PromisableArray } from '@xylabs/promise'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
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
import type { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import Cookies from 'js-cookie'

export type CookieArchivistConfigSchema = 'network.xyo.archivist.cookie.config'
export const CookieArchivistConfigSchema: CookieArchivistConfigSchema = 'network.xyo.archivist.cookie.config'

export type CookieArchivistConfig = ArchivistConfig<{
  domain?: string
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  schema: CookieArchivistConfigSchema
}>

export type CookieArchivistParams = ArchivistParams<AnyConfigSchema<CookieArchivistConfig>>

export class CookieArchivist<
  TParams extends CookieArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, CookieArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = CookieArchivistConfigSchema

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

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    const payloadPairs = await PayloadBuilder.dataHashPairs(await this.get(hashes))
    const deletedPairs = (
      await Promise.all(
        payloadPairs.map<[Payload, Hash]>(([payload, hash]) => {
          Cookies.remove(hash)
          return [payload, hash]
        }),
      )
    ).filter(exists)
    return deletedPairs.map(([, hash]) => hash)
  }

  protected override getHandler(hashes: Hash[]): Promisable<WithStorageMeta<Payload>[]> {
    return (
      hashes.map((hash) => {
        const cookieString = Cookies.get(this.keyFromHash(hash))
        return cookieString ? JSON.parse(cookieString) : undefined
      })
    ).filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    try {
      const resultPayloads: WithStorageMeta<Payload>[] = await Promise.all(
        payloads.map(async (payload) => {
          const payloadWithMeta = await PayloadBuilder.addSequencedStorageMeta(payload)
          const value = JSON.stringify(payloadWithMeta)
          assertEx(value.length < this.maxEntrySize, () => `Payload too large [${payloadWithMeta._hash}, ${value.length}]`)
          Cookies.set(this.keyFromHash(payloadWithMeta._hash), value)
          Cookies.set(this.keyFromHash(payloadWithMeta._dataHash), value)
          return payloadWithMeta
        }),
      )
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
