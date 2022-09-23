import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule, XyoModuleInitializeQuerySchema, XyoModuleQueryResult, XyoModuleShutdownQuerySchema, XyoQuery } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoDivinerConfig } from './Config'
import { DivinerModule } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery } from './Queries'

export abstract class XyoDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoModule<TConfig> implements DivinerModule {
  abstract divine(context?: string, data?: XyoPayloads): Promisable<XyoPayloads>

  public override queries(): string[] {
    return [XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoDivinerDivineQuerySchema]
  }

  override async query<T extends XyoQuery = XyoQuery>(bw: XyoBoundWitness, query: T): Promise<XyoModuleQueryResult<XyoPayload>> {
    assertEx(this.queryable(query.schema, bw.addresses))

    const queryAccount = new XyoAccount()
    if (!this.queries().find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: XyoPayloads = []
    const typedQuery = query as XyoDivinerQuery
    switch (typedQuery.schema) {
      case XyoDivinerDivineQuerySchema:
        payloads.push(...(await this.divine(typedQuery.context, typedQuery.payloads)))
        break
      default:
        return super.query(bw, typedQuery)
    }
    return await this.bindPayloads(payloads, queryAccount)
  }
}

export abstract class XyoTimestampDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<TConfig> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<TConfig> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractTimestampDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoTimestampDiviner<TConfig> {}
