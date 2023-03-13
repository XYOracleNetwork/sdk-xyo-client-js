import { assertEx } from '@xylabs/assert'
import { ArchivistParams } from '@xyo-network/archivist'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { creatableModule } from '@xyo-network/module'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from './AbstractDiviner'

export type IdentityDivinerParams<TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>> = ArchivistParams<TConfig>

@creatableModule()
export class IdentityDiviner<TParams extends IdentityDivinerParams = IdentityDivinerParams> extends AbstractDiviner<TParams> {
  static override targetSchema = 'network.xyo.test'

  static override async create<TParams extends IdentityDivinerParams>(params?: TParams) {
    return (await super.create(params)) as IdentityDiviner
  }

  override divine(payloads?: XyoPayloads): Promisable<XyoPayloads> {
    return assertEx(payloads, 'IdentityDiviner requires passed payload')
  }
}
