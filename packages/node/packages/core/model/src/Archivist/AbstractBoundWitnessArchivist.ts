import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoArchivistFindQuerySchema, XyoArchivistGetQuerySchema, XyoArchivistInsertQuerySchema, XyoArchivistQuery } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { AbstractModule, ModuleQueryResult, QueryBoundWitnessWrapper, XyoQuery } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoBoundWitnessWithPartialMeta } from '../BoundWitness'
import { ArchiveModuleConfig, ArchiveModuleConfigSchema } from './ArchiveModuleConfig'
import { BoundWitnessArchivist } from './BoundWitnessArchivist'
import { XyoBoundWitnessFilterPredicate } from './XyoBoundWitnessFilterPredicate'

export abstract class AbstractBoundWitnessArchivist extends AbstractModule<ArchiveModuleConfig> implements BoundWitnessArchivist {
  constructor(protected readonly account: Account = new Account(), config?: ArchiveModuleConfig) {
    super({ account, config: config ?? { archive: 'temp', schema: ArchiveModuleConfigSchema } })
  }

  public override queries() {
    return [XyoArchivistFindQuerySchema, XyoArchivistGetQuerySchema, XyoArchivistInsertQuerySchema]
  }

  override async query<T extends XyoQuery = XyoQuery>(query: T, payloads?: XyoPayloads): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    // assertEx(this.queryable(query.schema, wrapper.addresses))

    const result: XyoPayload[] = []
    const queryAccount = new Account()
    switch (typedQuery.schema) {
      case XyoArchivistFindQuerySchema:
        if (typedQuery.filter) result.push(...(await this.find(typedQuery.filter as XyoBoundWitnessFilterPredicate)))
        break
      case XyoArchivistGetQuerySchema:
        result.push(...(await this.get(typedQuery.hashes)))
        break
      case XyoArchivistInsertQuerySchema: {
        const wrappers = payloads?.map((payload) => PayloadWrapper.parse(payload)) ?? []
        assertEx(typedQuery.payloads, `Missing payloads: ${JSON.stringify(typedQuery, null, 2)}`)
        const resolvedWrappers = wrappers.filter((wrapper) => typedQuery.payloads.includes(wrapper.hash))
        assertEx(resolvedWrappers.length === typedQuery.payloads.length, 'Could not find some passed hashes')
        result.push(...(await this.insert(resolvedWrappers.map((wrapper) => wrapper.payload) as XyoBoundWitnessWithPartialMeta[])))
        break
      }
      default:
        throw new Error(`${typedQuery.schema} Not Implemented`)
    }
    return this.bindResult(result, queryAccount)
  }
  abstract find(filter?: XyoBoundWitnessFilterPredicate | undefined): Promise<Array<XyoBoundWitnessWithPartialMeta>>
  abstract get(ids: string[]): Promise<Array<XyoBoundWitnessWithPartialMeta>>
  abstract insert(item: XyoBoundWitnessWithPartialMeta[]): Promise<XyoBoundWitness[]>
}
