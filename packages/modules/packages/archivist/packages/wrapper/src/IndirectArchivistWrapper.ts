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
import compact from 'lodash/compact'

constructableModuleWrapper()
export class IndirectArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends ModuleWrapper<TWrappedModule>
  implements ArchivistModule<TWrappedModule['params']>
{
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  async all(): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap<ArchivistAllQuery>({ schema: ArchivistAllQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result)
  }

  async clear(): Promise<void> {
    const queryPayload = PayloadWrapper.wrap<ArchivistClearQuery>({ schema: ArchivistClearQuerySchema })
    await this.sendQuery(queryPayload)
  }

  async commit(): Promise<BoundWitness[]> {
    const queryPayload = PayloadWrapper.wrap<ArchivistCommitQuery>({ schema: ArchivistCommitQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return result.filter(isBoundWitnessPayload)
  }

  async delete(hashes: string[]): Promise<boolean[]> {
    const queryPayload = PayloadWrapper.wrap<ArchivistDeleteQuery>({ hashes, schema: ArchivistDeleteQuerySchema })
    await this.sendQuery(queryPayload)
    //just returning all true for now
    return hashes.map((_hash) => true)
  }

  async get(hashes: string[]): Promise<(Payload | null)[]> {
    const queryPayload = PayloadWrapper.wrap<ArchivistGetQuery>({ hashes, schema: ArchivistGetQuerySchema })
    return await this.sendQuery(queryPayload)
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const queryPayload = PayloadWrapper.wrap<ArchivistInsertQuery>({
      payloads: await PayloadHasher.hashes(payloads),
      schema: ArchivistInsertQuerySchema,
    })
    const result = await this.sendQuery(queryPayload)
    const innerBoundWitnesses = result.filter<BoundWitness>((payload): payload is BoundWitness => payload?.schema === BoundWitnessSchema) ?? []
    return innerBoundWitnesses
  }
}
