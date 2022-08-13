import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

import { XyoAbstractDiviner } from '../Diviner'
import { XyoSequenceDivinerQueryPayload } from './XyoSequenceDivinerQueryPayload'

export abstract class XyoSequenceDiviner<
  TQueryPayload extends XyoSequenceDivinerQueryPayload = XyoSequenceDivinerQueryPayload,
> extends XyoAbstractDiviner<TQueryPayload> {
  override divine(query: XyoSequenceDivinerQueryPayload): [XyoBoundWitness, XyoPayload[]] {
    return [this.bindHashes(query.payload_hashes, query.payload_schemas), []]
  }
}
