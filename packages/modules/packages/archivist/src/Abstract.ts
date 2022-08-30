import { assertEx } from '@xylabs/sdk-js'
import { XyoModule, XyoModuleQueryResult } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promisable'

import { Archivist } from './Archivist'
import { XyoArchivistConfig, XyoArchivistParents } from './Config'
import {
  XyoArchivistAllQueryPayloadSchema,
  XyoArchivistClearQueryPayloadSchema,
  XyoArchivistCommitQueryPayloadSchema,
  XyoArchivistDeleteQueryPayloadSchema,
  XyoArchivistFindQueryPayloadSchema,
  XyoArchivistGetQueryPayloadSchema,
  XyoArchivistInsertQueryPayloadSchema,
  XyoArchivistQueryPayload,
  XyoArchivistQueryPayloadSchema,
} from './Query'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoArchivist<TConfig extends XyoPayload = XyoPayload>
  extends XyoModule<XyoArchivistConfig<TConfig>>
  implements Archivist<XyoPayload, XyoPayload, XyoPayload, XyoPayload, XyoPayloadFindFilter>
{
  public override get queries(): XyoArchivistQueryPayloadSchema[] {
    return [XyoArchivistGetQueryPayloadSchema, XyoArchivistInsertQueryPayloadSchema]
  }

  public all(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  public clear(): Promisable<void> {
    throw Error('Not implemented')
  }

  public commit(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  public delete(_hashes: string[]): PromisableArray<boolean> {
    throw Error('Not implemented')
  }

  public find(_filter: XyoPayloadFindFilter): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  abstract get(hashes: string[]): NullablePromisableArray<XyoPayload>

  abstract insert(item: XyoPayload[]): PromisableArray<XyoPayload>

  async query(query: XyoArchivistQueryPayload): Promise<XyoModuleQueryResult> {
    if (!this.queries.find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (XyoPayload | null)[] = []
    switch (query.schema) {
      case XyoArchivistAllQueryPayloadSchema:
        payloads.push(...(await this.all()))
        break
      case XyoArchivistClearQueryPayloadSchema:
        await this.clear()
        break
      case XyoArchivistCommitQueryPayloadSchema:
        payloads.push(...(await this.commit()))
        break
      case XyoArchivistDeleteQueryPayloadSchema:
        await this.delete(query.hashes)
        break
      case XyoArchivistFindQueryPayloadSchema:
        payloads.push(...(await this.find(query.filter)))
        break
      case XyoArchivistGetQueryPayloadSchema:
        payloads.push(...(await this.get(query.hashes)))
        break
      case XyoArchivistInsertQueryPayloadSchema:
        payloads.push(...(await this.insert(query.payloads)))
        break
    }
    return [this.bindPayloads(payloads), payloads]
  }

  get resolver() {
    return this.config.resolver
  }

  private resolveArchivists(archivists?: Record<string, XyoModule | null | undefined>) {
    const resolved: Record<string, XyoModule | null | undefined> = {}
    if (archivists) {
      Object.entries(archivists).forEach(([key, value]) => {
        resolved[key] = value ?? this.resolver?.(key) ?? null
      })
    }
    return resolved
  }

  private _parents?: XyoArchivistParents
  get parents() {
    this._parents = this._parents ?? {
      commit: this.resolveArchivists(this.config.parents?.commit),
      read: this.resolveArchivists(this.config.parents?.read),
      write: this.resolveArchivists(this.config.parents?.write),
    }
    return assertEx(this._parents)
  }
}
