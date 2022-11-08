import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivistFindQuerySchema, XyoArchivistGetQuerySchema, XyoArchivistInsertQuerySchema, XyoArchivistQuery } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { EmptyObject } from '@xyo-network/core'
import { ModuleQueryResult, QueryBoundWitnessWrapper, XyoModule, XyoQuery } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { injectable } from 'inversify'

import { XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '../Payload'
import { ArchiveModuleConfig, ArchiveModuleConfigSchema } from './ArchiveModuleConfig'
import { PayloadArchivist } from './PayloadArchivist'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

@injectable()
export abstract class AbstractPayloadArchivist<T extends EmptyObject = EmptyObject, TConfig extends ArchiveModuleConfig = ArchiveModuleConfig>
  extends XyoModule<TConfig>
  implements PayloadArchivist<T>
{
  constructor(protected readonly account: XyoAccount = new XyoAccount(), config?: TConfig) {
    super({ account, config: config ?? ({ archive: 'temp', schema: ArchiveModuleConfigSchema } as TConfig) })
  }

  override queries() {
    return [XyoArchivistFindQuerySchema, XyoArchivistGetQuerySchema, XyoArchivistInsertQuerySchema]
  }
  override async query<Q extends XyoQuery = XyoQuery>(query: Q, payloads?: XyoPayloads): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    // assertEx(this.queryable(query.schema, wrapper.addresses))

    const result: XyoPayload[] = []
    const queryAccount = new XyoAccount()
    switch (typedQuery.schema) {
      case XyoArchivistFindQuerySchema:
        if (typedQuery.filter) {
          const typedFilter = typedQuery.filter as XyoPayloadFilterPredicate
          result.push(...(await this.find(typedFilter)))
        }
        break
      case XyoArchivistGetQuerySchema:
        result.push(...(await this.get(typedQuery.hashes)))
        break
      case XyoArchivistInsertQuerySchema: {
        const wrappers = payloads?.map((payload) => PayloadWrapper.parse(payload)) ?? []
        assertEx(typedQuery.payloads, `Missing payloads: ${JSON.stringify(typedQuery, null, 2)}`)
        const resolvedWrappers = wrappers.filter((wrapper) => typedQuery.payloads.includes(wrapper.hash))
        assertEx(resolvedWrappers.length === typedQuery.payloads.length, 'Could not find some passed hashes')
        const items = resolvedWrappers.map((wrapper) => wrapper.payload) as XyoPayloadWithPartialMeta<T>[]
        result.push(...(await this.insert(items)))
        break
      }
      default:
        throw new Error(`${typedQuery.schema} Not Implemented`)
    }
    return this.bindResult(result, queryAccount)
  }

  abstract find(filter: XyoPayloadFilterPredicate<T>): Promise<XyoPayloadWithMeta<T>[]>
  abstract get(id: string[]): Promise<Array<XyoPayloadWithMeta<T>>>
  abstract insert(items: XyoPayloadWithPartialMeta<T>[]): Promise<XyoBoundWitness[]>
}
