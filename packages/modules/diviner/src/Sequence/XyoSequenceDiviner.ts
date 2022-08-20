import { XyoModuleQueryResult } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'

import { XyoAbstractDiviner } from '../Abstract'
import { XyoDivinerConfig } from '../Config'
import { XyoSequenceDivinerQueryPayload } from './XyoSequenceDivinerQueryPayload'

export abstract class XyoSequenceDiviner<
  TConfig extends XyoDivinerConfig = XyoDivinerConfig,
  TQueryPayload extends XyoSequenceDivinerQueryPayload = XyoSequenceDivinerQueryPayload,
> extends XyoAbstractDiviner<TConfig, TQueryPayload> {
  override query(query: XyoSequenceDivinerQueryPayload): Promisable<XyoModuleQueryResult> {
    return [this.bindHashes(query.payload_hashes, query.payload_schemas), []]
  }
}
