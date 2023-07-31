import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
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
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'
import Cookies from 'js-cookie'
import compact from 'lodash/compact'

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

  protected override allHandler(): PromisableArray<Payload> {
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

  protected override async commitHandler(): Promise<BoundWitness[]> {
    try {
      const payloads = await this.all()
      assertEx(payloads.length > 0, 'Nothing to commit')
      const settled = await Promise.allSettled(
        compact(
          Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
            const queryPayload: ArchivistInsertQuery = {
              schema: ArchivistInsertQuerySchema,
            }
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

  protected override async deleteHandler(hashes: string[]): Promise<Payload[]> {
    const payloadPairs: [string, Payload][] = await Promise.all(
      (await this.get(hashes)).map<Promise<[string, Payload]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
    )
    const deletedPairs: [string, Payload][] = compact(
      await Promise.all(
        payloadPairs.map<[string, Payload] | undefined>(([hash, payload]) => {
          Cookies.remove(hash)
          return [hash, payload]
        }),
      ),
    )
    await this.emit('deleted', { hashes: deletedPairs.map(([hash, _]) => hash), module: this })
    const result = deletedPairs.map(([_, payload]) => payload)
    return result
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    try {
      return await Promise.all(
        hashes.map(async (hash) => {
          const cookieString = Cookies.get(this.keyFromHash(hash))
          return cookieString ? JSON.parse(cookieString) : (await this.getFromParents(hash)) ?? null
        }),
      )
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  protected async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    try {
      const resultPayloads: Payload[] = await Promise.all(
        payloads.map(async (payload) => {
          const wrapper = PayloadWrapper.wrap(payload)
          const key = this.keyFromHash(await wrapper.hashAsync())
          const value = JSON.stringify(wrapper.payload())
          assertEx(value.length < this.maxEntrySize, `Payload too large [${wrapper.hashAsync()}, ${value.length}]`)
          Cookies.set(key, JSON.stringify(wrapper.payload()))
          return wrapper.payload()
        }),
      )
      await this.writeToParents(resultPayloads)
      await this.emit('inserted', { module: this, payloads })
      return payloads
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  private keyFromHash(hash: string) {
    return `${this.namespace}-${hash}`
  }
}
