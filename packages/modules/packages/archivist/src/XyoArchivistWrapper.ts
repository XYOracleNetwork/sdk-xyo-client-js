import { XyoModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { Archivist } from './Archivist'
import {
  XyoArchivistAllQueryPayload,
  XyoArchivistAllQueryPayloadSchema,
  XyoArchivistClearQueryPayload,
  XyoArchivistClearQueryPayloadSchema,
  XyoArchivistCommitQueryPayload,
  XyoArchivistCommitQueryPayloadSchema,
  XyoArchivistDeleteQueryPayload,
  XyoArchivistDeleteQueryPayloadSchema,
  XyoArchivistFindQueryPayload,
  XyoArchivistFindQueryPayloadSchema,
  XyoArchivistGetQueryPayload,
  XyoArchivistGetQueryPayloadSchema,
  XyoArchivistInsertQueryPayload,
  XyoArchivistInsertQueryPayloadSchema,
} from './Query'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export class XyoArchivistWrapper implements Archivist<XyoPayload | null, XyoPayload | null, XyoPayload, XyoPayload | null, XyoPayloadFindFilter> {
  protected module: XyoModule

  constructor(module: XyoModule) {
    this.module = module
  }

  public get queries() {
    return this.module.queries
  }

  public async delete(hashes: string[]) {
    const query: XyoArchivistDeleteQueryPayload = { hashes, schema: XyoArchivistDeleteQueryPayloadSchema }
    return (await this.module.query(query))[0].payload_hashes.map(() => true)
  }

  public async clear(): Promise<void> {
    const query: XyoArchivistClearQueryPayload = { schema: XyoArchivistClearQueryPayloadSchema }
    await this.module.query(query)
  }

  public async get(hashes: string[]): Promise<(XyoPayload | null)[]> {
    const query: XyoArchivistGetQueryPayload = { hashes, schema: XyoArchivistGetQueryPayloadSchema }
    return (await this.module.query(query))[1]
  }

  public async insert(payloads: XyoPayload[]): Promise<(XyoPayload | null)[]> {
    const query: XyoArchivistInsertQueryPayload = { payloads, schema: XyoArchivistInsertQueryPayloadSchema }
    return (await this.module.query(query))[1]
  }

  public async find(filter: XyoPayloadFindFilter): Promise<(XyoPayload | null)[]> {
    const query: XyoArchivistFindQueryPayload = { filter, schema: XyoArchivistFindQueryPayloadSchema }
    return (await this.module.query(query))[1]
  }

  public async all(): Promise<(XyoPayload | null)[]> {
    const query: XyoArchivistAllQueryPayload = { schema: XyoArchivistAllQueryPayloadSchema }
    return (await this.module.query(query))[1]
  }

  public async commit(): Promise<(XyoPayload | null)[]> {
    const query: XyoArchivistCommitQueryPayload = { schema: XyoArchivistCommitQueryPayloadSchema }
    return (await this.module.query(query))[1]
  }
}
