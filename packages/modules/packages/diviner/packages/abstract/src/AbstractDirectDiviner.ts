import { DirectDivinerModule, DivinerModuleEventData, DivinerParams } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { AbstractIndirectDiviner } from './AbstractIndirectDiviner'

export abstract class AbstractDirectDiviner<
    TParams extends DivinerParams = DivinerParams,
    TEventData extends DivinerModuleEventData = DivinerModuleEventData,
  >
  extends AbstractIndirectDiviner<TParams, TEventData>
  implements DirectDivinerModule<TParams>
{
  async divine(payloads?: Payload[]): Promise<Payload[]> {
    return await this.divineHandler(payloads)
  }
}
