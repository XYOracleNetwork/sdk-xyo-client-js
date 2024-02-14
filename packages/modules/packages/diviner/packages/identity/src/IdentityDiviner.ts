import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { ArchivistParams } from '@xyo-network/archivist-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type IdentityDivinerParams<TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>> = ArchivistParams<TConfig>

@creatableModule()
export class IdentityDiviner<TParams extends IdentityDivinerParams = IdentityDivinerParams, TIn extends Payload = Payload> extends AbstractDiviner<
  TParams,
  TIn,
  TIn
> {
  static override targetSchema = 'network.xyo.test'

  protected override divineHandler(payloads?: TIn[]): Promisable<TIn[]> {
    return assertEx(payloads, 'IdentityDiviner requires passed payload') as TIn[]
  }
}
