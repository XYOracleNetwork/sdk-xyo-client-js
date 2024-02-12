import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { fulfilled, Promisable, PromisableArray } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'
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
  static override configSchemas = [CookieArchivistConfigSchema]

  get domain() {
    return this.config?.domain
  }

  get maxEntries() {
    //all browsers support at least 60 cookies
    return this.config?.maxEntries ?? 60
  }

  get maxEntrySize() {
    //all browsers support at least 4000 length per cookie
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

  protected override allHandler(): PromisableArray<WithMeta<Payload>> {
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
      Object.entries(Cookies.get()).map(([key]) => {
        if (key.startsWith(`${this.namespace}-`)) {
          Cookies.remove(key)
        }
      })
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  protected override async commitHandler(): Promise<WithMeta<BoundWitness>[]> {
    try {
      const payloads = await this.all()
      assertEx(payloads.length > 0, 'Nothing to commit')
      const settled = await Promise.allSettled(
        compact(
          Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
            const queryPayload: WithMeta<ArchivistInsertQuery> = await PayloadBuilder.build({
              schema: ArchivistInsertQuerySchema,
            })
            const query = await this.bindQuery(queryPayload, payloads)
            return (await parent?.query(query[0], query[1]))?.[0]
          }),
        ),
      )
      await this.clear()
      return compact(settled.filter(fulfilled).map((result) => result.value))
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<string[]> {
    const payloadPairs = await PayloadBuilder.dataHashPairs(await this.get(hashes))
    const deletedPairs = compact(
      await Promise.all(
        payloadPairs.map<[Payload, Hash]>(([payload, hash]) => {
          Cookies.remove(hash)
          return [payload, hash]
        }),
      ),
    )
    return deletedPairs.map(([, hash]) => hash)
  }

  protected override getHandler(hashes: Hash[]): Promisable<PayloadWithMeta[]> {
    return compact(
      hashes.map((hash) => {
        const cookieString = Cookies.get(this.keyFromHash(hash))
        return cookieString ? JSON.parse(cookieString) : undefined
      }),
    )
  }

  protected override async insertHandler(payloads: Payload[]): Promise<WithMeta<Payload>[]> {
    try {
      const pairs = await PayloadBuilder.hashPairs(payloads)
      const resultPayloads: WithMeta<Payload>[] = await Promise.all(
        pairs.map(async ([payload, hash]) => {
          const payloadWithMeta = await PayloadBuilder.build(payload)
          const value = JSON.stringify(payloadWithMeta)
          assertEx(value.length < this.maxEntrySize, () => `Payload too large [${hash}, ${value.length}]`)
          Cookies.set(this.keyFromHash(hash), value)
          Cookies.set(this.keyFromHash(payload.$hash), value)
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
