import {
  ArchivistAllQuery,
  ArchivistAllQuerySchema,
  ArchivistClearQuery,
  ArchivistClearQuerySchema,
  ArchivistCommitQuery,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuery,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModule,
} from '@xyo-network/archivist-model'
import { BoundWitness, BoundWitnessSchema, isBoundWitnessPayload } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends ModuleWrapper<TWrappedModule>
  implements ArchivistModule
{
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  start?: (() => Promisable<void>) | undefined

  async all(): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap({ schema: ArchivistAllQuerySchema }) as PayloadWrapper<ArchivistAllQuery>
    const result = await this.sendQuery(queryPayload)
    return compact(result)
  }

  async clear(): Promise<void> {
    const queryPayload = PayloadWrapper.parse({ schema: ArchivistClearQuerySchema }) as PayloadWrapper<ArchivistClearQuery>
    await this.sendQuery(queryPayload)
  }

  async commit(): Promise<BoundWitness[]> {
    const queryPayload = PayloadWrapper.parse({ schema: ArchivistCommitQuerySchema }) as PayloadWrapper<ArchivistCommitQuery>
    const result = await this.sendQuery(queryPayload)
    return result.filter(isBoundWitnessPayload)
  }

  async delete(hashes: string[]) {
    const queryPayload = PayloadWrapper.parse({ hashes, schema: ArchivistDeleteQuerySchema }) as PayloadWrapper<ArchivistDeleteQuery>
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    await this.throwErrors(query, result)
    return result[0].payload_hashes.map(() => true)
  }

  async get(hashes: string[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse({ hashes, schema: ArchivistGetQuerySchema }) as PayloadWrapper<ArchivistGetQuery>
    const result = await this.sendQuery(queryPayload)
    return result
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const queryPayload = PayloadWrapper.parse({
      payloads: await PayloadHasher.hashes(payloads),
      schema: ArchivistInsertQuerySchema,
    }) as PayloadWrapper<ArchivistInsertQuery>
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.query(query[0], [queryPayload.payload(), ...payloads])
    const innerBoundWitnesses = result[1]?.filter<BoundWitness>((payload): payload is BoundWitness => payload?.schema === BoundWitnessSchema) ?? []
    await this.throwErrors(query, result)
    return [result[0], ...innerBoundWitnesses]
  }
}
