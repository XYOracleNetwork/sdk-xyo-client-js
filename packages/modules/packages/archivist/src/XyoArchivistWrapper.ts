import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloadFindFilter } from '@xyo-network/payload'
import compact from 'lodash/compact'

import { PayloadArchivist } from './Archivist'
import {
  XyoArchivistAllQuery,
  XyoArchivistAllQuerySchema,
  XyoArchivistClearQuery,
  XyoArchivistClearQuerySchema,
  XyoArchivistCommitQuery,
  XyoArchivistCommitQuerySchema,
  XyoArchivistDeleteQuery,
  XyoArchivistDeleteQuerySchema,
  XyoArchivistFindQuery,
  XyoArchivistFindQuerySchema,
  XyoArchivistGetQuery,
  XyoArchivistGetQuerySchema,
  XyoArchivistInsertQuery,
  XyoArchivistInsertQuerySchema,
} from './Queries'

export class XyoArchivistWrapper extends XyoModuleWrapper implements PayloadArchivist {
  public async delete(hashes: string[]) {
    const queryPayload = PayloadWrapper.parse<XyoArchivistDeleteQuery>({ hashes, schema: XyoArchivistDeleteQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[0].payload_hashes.map(() => true)
  }

  public async clear(): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoArchivistClearQuery>({ schema: XyoArchivistClearQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
  }

  public async get(hashes: string[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoArchivistGetQuery>({ hashes, schema: XyoArchivistGetQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[1]
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    const queryPayload = PayloadWrapper.parse<XyoArchivistInsertQuery>({
      payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
      schema: XyoArchivistInsertQuerySchema,
    })
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.query(query[0], [queryPayload.payload, ...payloads])
    const innerBoundWitnesses =
      result[1]?.filter<XyoBoundWitness>((payload): payload is XyoBoundWitness => payload?.schema === XyoBoundWitnessSchema) ?? []
    this.throwErrors(query, result)
    return [result[0], ...innerBoundWitnesses]
  }

  public async find(filter?: XyoPayloadFindFilter): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoArchivistFindQuery>({ filter, schema: XyoArchivistFindQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], [queryPayload.payload])
    this.throwErrors(query, result)
    return compact(result[1])
  }

  public async all(): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoArchivistAllQuery>({ schema: XyoArchivistAllQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return compact(result[1])
  }

  public async commit(): Promise<XyoBoundWitness[]> {
    const queryPayload = PayloadWrapper.parse<XyoArchivistCommitQuery>({ schema: XyoArchivistCommitQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[1] as XyoBoundWitness[]
  }
}
