import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ArchivistFindQuerySchema, ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistQuery } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EmptyObject } from '@xyo-network/core'
import { AbstractModule, ModuleQueryResult, QueryBoundWitnessWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '../Payload'
import { ArchiveModuleConfig, ArchiveModuleConfigSchema } from './ArchiveModuleConfig'
import { PayloadArchivist } from './PayloadArchivist'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

export abstract class AbstractPayloadArchivist<T extends EmptyObject = EmptyObject, TConfig extends ArchiveModuleConfig = ArchiveModuleConfig>
  extends AbstractModule<TConfig>
  implements PayloadArchivist<T>
{
  constructor(protected readonly account: Account = new Account(), config?: TConfig) {
    super({ account, config: config ?? ({ archive: 'temp', schema: ArchiveModuleConfigSchema } as TConfig) })
  }

  override queries() {
    return [ArchivistFindQuerySchema, ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ...super.queries()]
  }
  override async query<Q extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: Q,
    payloads?: XyoPayloads,
  ): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    // Can be brought back once this is module called with .create
    // assertEx(this.queryable(query.schema, wrapper.addresses))

    const result: XyoPayload[] = []
    const queryAccount = new Account()
    switch (typedQuery.schema) {
      case ArchivistFindQuerySchema:
        if (typedQuery.filter) {
          const typedFilter = typedQuery.filter as XyoPayloadFilterPredicate
          result.push(...(await this.find(typedFilter)))
        }
        break
      case ArchivistGetQuerySchema:
        result.push(...(await this.get(typedQuery.hashes)))
        break
      case ArchivistInsertQuerySchema: {
        const wrappers = payloads?.map((payload) => PayloadWrapper.parse(payload)) ?? []
        assertEx(typedQuery.payloads, `Missing payloads: ${JSON.stringify(typedQuery, null, 2)}`)
        const resolvedWrappers = wrappers.filter((wrapper) => typedQuery.payloads.includes(wrapper.hash))
        assertEx(resolvedWrappers.length === typedQuery.payloads.length, 'Could not find some passed hashes')
        const items = resolvedWrappers.map((wrapper) => wrapper.payload) as XyoPayloadWithPartialMeta<T>[]
        result.push(...(await this.insert(items)))
        break
      }
      default:
        return super.query(query, payloads)
    }
    return this.bindResult(result, queryAccount)
  }

  abstract find(filter: XyoPayloadFilterPredicate<T>): Promise<XyoPayloadWithMeta<T>[]>
  abstract get(id: string[]): Promise<Array<XyoPayloadWithMeta<T>>>
  abstract insert(items: XyoPayloadWithPartialMeta<T>[]): Promise<XyoBoundWitness[]>
}
