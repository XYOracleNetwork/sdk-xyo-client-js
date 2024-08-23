import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import {
  DivinerConfig, DivinerInstance, DivinerModuleEventData, DivinerParams,
} from '@xyo-network/diviner-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type IdentityDivinerParams<TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>> = DivinerParams<TConfig>

@creatableModule()
export class IdentityDiviner<
  TParams extends IdentityDivinerParams = IdentityDivinerParams,
  TIn extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TIn>, TIn, TIn> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TIn>,
    TIn,
    TIn
  >,
> extends AbstractDiviner<TParams, TIn, TIn, TEventData> {
  static override targetSchema = 'network.xyo.test'

  protected override divineHandler(payloads?: TIn[]): Promisable<TIn[]> {
    return assertEx(payloads, () => 'IdentityDiviner requires passed payload') as TIn[]
  }
}
