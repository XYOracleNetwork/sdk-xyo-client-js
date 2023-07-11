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
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModule,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import { BoundWitness, BoundWitnessSchema, isBoundWitnessPayload } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import compact from 'lodash/compact'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends ModuleWrapper<TWrappedModule>
  implements ArchivistModule<TWrappedModule['params']>
{
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  async all(): Promise<Payload[]> {
    if (isArchivistInstance(this.module)) {
      return await assertEx(this.module.all, 'Archivist does not support all')()
    }
    const queryPayload = PayloadWrapper.wrap<ArchivistAllQuery>({ schema: ArchivistAllQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result)
  }

  async clear(): Promise<void> {
    if (isArchivistInstance(this.module)) {
      return await assertEx(this.module.clear, 'Archivist does not support clear')()
    }
    const queryPayload = PayloadWrapper.wrap<ArchivistClearQuery>({ schema: ArchivistClearQuerySchema })
    await this.sendQuery(queryPayload)
  }

  async commit(): Promise<BoundWitness[]> {
    if (isArchivistInstance(this.module)) {
      return await assertEx(this.module.commit, 'Archivist does not support commit')()
    }
    const queryPayload = PayloadWrapper.wrap<ArchivistCommitQuery>({ schema: ArchivistCommitQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return result.filter(isBoundWitnessPayload)
  }

  async delete(hashes: string[]): Promise<boolean[]> {
    if (isArchivistInstance(this.module)) {
      return await assertEx(this.module.delete, 'Archivist does not support delete')(hashes)
    }
    const queryPayload = PayloadWrapper.wrap<ArchivistDeleteQuery>({ hashes, schema: ArchivistDeleteQuerySchema })
    await this.sendQuery(queryPayload)
    //just returning all true for now
    return hashes.map((_hash) => true)
  }

  async get(hashes: string[]): Promise<(Payload | null)[]> {
    if (isArchivistInstance(this.module)) {
      return await this.module.get(hashes)
    }
    const queryPayload = PayloadWrapper.wrap<ArchivistGetQuery>({ hashes, schema: ArchivistGetQuerySchema })
    return await this.sendQuery(queryPayload)
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    if (isArchivistInstance(this.module)) {
      return await assertEx(this.module.insert, 'Archivist does not support insert')(payloads)
    }
    const queryPayload = PayloadWrapper.wrap<ArchivistInsertQuery>({
      payloads: await PayloadHasher.hashes(payloads),
      schema: ArchivistInsertQuerySchema,
    })
    const result = await this.sendQuery(queryPayload)
    const innerBoundWitnesses = result.filter<BoundWitness>((payload): payload is BoundWitness => payload?.schema === BoundWitnessSchema) ?? []
    return innerBoundWitnesses
  }
}
