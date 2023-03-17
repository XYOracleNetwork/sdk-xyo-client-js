import { assertEx } from '@xylabs/assert'
import { ArchivistParams } from '@xyo-network/archivist'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { creatableModule } from '@xyo-network/module'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from './AbstractDiviner'

export type IdentityDivinerParams<TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>> = ArchivistParams<TConfig>

@creatableModule()
export class IdentityDiviner<TParams extends IdentityDivinerParams = IdentityDivinerParams> extends AbstractDiviner<TParams> {
  static override targetSchema = 'network.xyo.test'

  override divine(payloads?: Payload[]): Promisable<Payload[]> {
    return assertEx(payloads, 'IdentityDiviner requires passed payload')
  }
}
