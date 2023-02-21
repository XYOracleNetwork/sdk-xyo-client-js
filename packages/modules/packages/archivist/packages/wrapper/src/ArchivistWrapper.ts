import { assertEx } from '@xylabs/assert'
import {
  ArchivistAllQuery,
  ArchivistAllQuerySchema,
  ArchivistClearQuery,
  ArchivistClearQuerySchema,
  ArchivistCommitQuery,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuery,
  ArchivistDeleteQuerySchema,
  ArchivistFindQuery,
  ArchivistFindQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModule,
} from '@xyo-network/archivist-interface'
import { isXyoBoundWitnessPayload, XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { Module, ModuleWrapper } from '@xyo-network/module'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import compact from 'lodash/compact'

export class ArchivistWrapper extends ModuleWrapper implements ArchivistModule {
  static requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  static tryWrap(module: Module): ArchivistWrapper | undefined {
    const missingRequiredQueries = this.missingRequiredQueries(module)
    if (missingRequiredQueries.length > 0) {
      console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
    } else {
      return new ArchivistWrapper(module as ArchivistModule)
    }
  }

  static wrap(module: Module): ArchivistWrapper {
    return assertEx(this.tryWrap(module), 'Unable to wrap module as ArchivistWrapper')
  }

  public async all(): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistAllQuery>({ schema: ArchivistAllQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result)
  }

  public async clear(): Promise<void> {
    const queryPayload = PayloadWrapper.parse<ArchivistClearQuery>({ schema: ArchivistClearQuerySchema })
    await this.sendQuery(queryPayload)
  }

  public async commit(): Promise<XyoBoundWitness[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistCommitQuery>({ schema: ArchivistCommitQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return result.filter(isXyoBoundWitnessPayload)
  }

  public async delete(hashes: string[]) {
    const queryPayload = PayloadWrapper.parse<ArchivistDeleteQuery>({ hashes, schema: ArchivistDeleteQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[0].payload_hashes.map(() => true)
  }

  public async find<R extends XyoPayload = XyoPayload>(filter?: PayloadFindFilter): Promise<R[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistFindQuery>({ filter, schema: ArchivistFindQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result) as R[]
  }

  public async get(hashes: string[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistGetQuery>({ hashes, schema: ArchivistGetQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return result
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistInsertQuery>({
      payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
      schema: ArchivistInsertQuerySchema,
    })
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.query(query[0], [queryPayload.payload, ...payloads])
    const innerBoundWitnesses =
      result[1]?.filter<XyoBoundWitness>((payload): payload is XyoBoundWitness => payload?.schema === XyoBoundWitnessSchema) ?? []
    this.throwErrors(query, result)
    return [result[0], ...innerBoundWitnesses]
  }
}
