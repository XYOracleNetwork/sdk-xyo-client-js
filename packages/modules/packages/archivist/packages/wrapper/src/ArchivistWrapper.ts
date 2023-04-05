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
} from '@xyo-network/archivist-model'
import { BoundWitness, BoundWitnessSchema, isBoundWitnessPayload } from '@xyo-network/boundwitness-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import compact from 'lodash/compact'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends ModuleWrapper<TWrappedModule>
  implements ArchivistModule
{
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  async all(): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistAllQuery>({ schema: ArchivistAllQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result)
  }

  async clear(): Promise<void> {
    const queryPayload = PayloadWrapper.parse<ArchivistClearQuery>({ schema: ArchivistClearQuerySchema })
    await this.sendQuery(queryPayload)
  }

  async commit(): Promise<BoundWitness[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistCommitQuery>({ schema: ArchivistCommitQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return result.filter(isBoundWitnessPayload)
  }

  async delete(hashes: string[]) {
    const queryPayload = PayloadWrapper.parse<ArchivistDeleteQuery>({ hashes, schema: ArchivistDeleteQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[0].payload_hashes.map(() => true)
  }

  async find<R extends Payload = Payload>(filter?: PayloadFindFilter): Promise<R[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistFindQuery>({ filter, schema: ArchivistFindQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result) as R[]
  }

  async get(hashes: string[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistGetQuery>({ hashes, schema: ArchivistGetQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return result
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const queryPayload = PayloadWrapper.parse<ArchivistInsertQuery>({
      payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
      schema: ArchivistInsertQuerySchema,
    })
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.query(query[0], [queryPayload.payload, ...payloads])
    const innerBoundWitnesses = result[1]?.filter<BoundWitness>((payload): payload is BoundWitness => payload?.schema === BoundWitnessSchema) ?? []
    this.throwErrors(query, result)
    return [result[0], ...innerBoundWitnesses]
  }
}
