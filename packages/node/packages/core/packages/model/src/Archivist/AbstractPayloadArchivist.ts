import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ArchivistFindQuerySchema, ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistQuery } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EmptyObject } from '@xyo-network/core'
import { AbstractModule, AbstractModuleConfig, ModuleQueryResult, QueryBoundWitnessWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '../Payload'
import { PayloadArchivist } from './PayloadArchivist'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

export abstract class AbstractPayloadArchivist<T extends EmptyObject = EmptyObject, TConfig extends AbstractModuleConfig = AbstractModuleConfig>
  extends AbstractModule<TConfig>
  implements PayloadArchivist<T>
{
  override get queries(): string[] {
    return [ArchivistFindQuerySchema, ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }
  override async query<Q extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends AbstractModuleConfig = AbstractModuleConfig>(
    query: Q,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
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
