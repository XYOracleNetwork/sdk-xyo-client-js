import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistParams } from '@xyo-network/archivist-model'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export type IdentityDivinerParams<TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>> = ArchivistParams<TConfig>

@creatableModule()
export class IdentityDiviner<TParams extends IdentityDivinerParams = IdentityDivinerParams> extends AbstractDiviner<TParams> {
  static override targetSchema = 'network.xyo.test'

  protected override divineHandler(payloads?: Payload[]): Promisable<Payload[]> {
    return assertEx(payloads, 'IdentityDiviner requires passed payload')
  }
}
