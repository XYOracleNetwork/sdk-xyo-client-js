import { DirectDivinerModule, DivinerDivineQuerySchema, DivinerModule, isDivinerInstance } from '@xyo-network/diviner-model'
import { constructableModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { IndirectDivinerWrapper } from './IndirectDivinerWrapper'

constructableModuleWrapper()
export class DirectDivinerWrapper<TWrappedModule extends DivinerModule = DivinerModule>
  extends IndirectDivinerWrapper<TWrappedModule>
  implements DirectDivinerModule
{
  static override requiredQueries = [DivinerDivineQuerySchema, ...super.requiredQueries]

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    if (isDivinerInstance(this.module)) {
      return await this.module.divine(payloads)
    }
    return super.divine(payloads)
  }
}
