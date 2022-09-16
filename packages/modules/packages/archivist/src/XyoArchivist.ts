import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule, XyoModuleInitializeQuerySchema, XyoModuleQueryResult, XyoModuleShutdownQuerySchema } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'

import { PayloadArchivist } from './Archivist'
import { XyoArchivistConfig, XyoArchivistParents } from './Config'
import {
  XyoArchivistAllQuerySchema,
  XyoArchivistClearQuerySchema,
  XyoArchivistCommitQuerySchema,
  XyoArchivistDeleteQuerySchema,
  XyoArchivistFindQuerySchema,
  XyoArchivistGetQuery,
  XyoArchivistGetQuerySchema,
  XyoArchivistInsertQuery,
  XyoArchivistInsertQuerySchema,
  XyoArchivistQuery,
  XyoArchivistQuerySchema,
} from './Queries'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoArchivist<TConfig extends XyoPayload = XyoPayload, TQuery extends XyoArchivistQuery = XyoArchivistQuery>
  extends XyoModule<TQuery, XyoPayload, XyoArchivistConfig<TConfig>>
  implements PayloadArchivist<TQuery>
{
  public override queries(): XyoArchivistQuerySchema[] {
    return [
      XyoModuleInitializeQuerySchema,
      XyoModuleShutdownQuerySchema,
      XyoArchivistGetQuerySchema,
      XyoArchivistInsertQuerySchema,
      ...super.queries(),
    ]
  }

  public get cacheParentReads() {
    return !!this.config?.cacheParentReads
  }

  public get writeThrough() {
    return !!this.config?.writeThrough
  }

  public all(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  public clear(): Promisable<void> {
    throw Error('Not implemented')
  }

  public commit(): Promisable<XyoBoundWitness> {
    throw Error('Not implemented')
  }

  public delete(_hashes: string[]): PromisableArray<boolean> {
    throw Error('Not implemented')
  }

  public find(_filter?: XyoPayloadFindFilter): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  abstract get(hashes: string[]): NullablePromisableArray<XyoPayload>

  abstract insert(item: XyoPayload[]): Promisable<XyoBoundWitness>

  override async query(query: TQuery): Promise<XyoModuleQueryResult<XyoPayload>> {
    if (!this.queries().find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (XyoPayload | null)[] = []
    const queryAccount = new XyoAccount()
    switch (query.schema) {
      case XyoArchivistAllQuerySchema:
        payloads.push(...(await this.all()))
        break
      case XyoArchivistClearQuerySchema:
        await this.clear()
        break
      case XyoArchivistCommitQuerySchema:
        payloads.push(await this.commit())
        break
      case XyoArchivistDeleteQuerySchema:
        await this.delete(query.hashes)
        break
      case XyoArchivistFindQuerySchema:
        payloads.push(...(await this.find(query.filter)))
        break
      case XyoArchivistGetQuerySchema:
        payloads.push(...(await this.get(query.hashes)))
        break
      case XyoArchivistInsertQuerySchema:
        payloads.push(await this.insert(query.payloads), ...query.payloads)
        break
      default:
        return super.query(query)
    }
    return this.bindPayloads(payloads, queryAccount)
  }

  private resolveArchivists(archivists?: Record<string, PayloadArchivist | null | undefined>) {
    const resolved: Record<string, PayloadArchivist | null | undefined> = {}
    if (archivists) {
      Object.entries(archivists).forEach(([key, value]) => {
        resolved[key] = value ?? (this.resolver?.(key) as unknown as PayloadArchivist) ?? null
      })
    }
    return resolved
  }

  protected async getFromParents(hash: string) {
    return compact(
      await Promise.all(
        Object.values(this.parents?.read ?? {}).map(async (parent) => {
          const query: XyoArchivistGetQuery = { hashes: [hash], schema: XyoArchivistGetQuerySchema }
          const [, payloads] = (await parent?.query(query)) ?? []
          const wrapper = payloads?.[0] ? new PayloadWrapper(payloads?.[0]) : undefined
          if (wrapper && wrapper.hash !== hash) {
            console.warn(`Parent [${parent?.address}] returned payload with invalid hash [${hash} != ${wrapper.hash}]`)
            return null
          }
          return wrapper?.payload
        }),
      ),
    )[0]
  }

  protected async writeToParent(parent: PayloadArchivist, payloads: XyoPayload[]) {
    const query: XyoArchivistInsertQuery = { payloads, schema: XyoArchivistInsertQuerySchema }
    const [, writtenPayloads] = (await parent?.query(query)) ?? []
    return writtenPayloads
  }

  protected async writeToParents(payloads: XyoPayload[]) {
    return await Promise.all(
      Object.values(this.parents?.write ?? {}).map(async (parent) => {
        return parent ? await this.writeToParent(parent, payloads) : undefined
      }),
    )
  }

  private _parents?: XyoArchivistParents
  get parents() {
    this._parents = this._parents ?? {
      commit: this.resolveArchivists(this.config?.parents?.commit),
      read: this.resolveArchivists(this.config?.parents?.read),
      write: this.resolveArchivists(this.config?.parents?.write),
    }
    return assertEx(this._parents)
  }
}
