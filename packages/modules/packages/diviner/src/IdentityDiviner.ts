import { ArchivistParams } from '@xyo-network/archivist'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from './AbstractDiviner'

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>> = ArchivistParams<TConfig>

export class IdentityDiviner<TParams extends MemoryArchivistParams> extends AbstractDiviner<TParams> {
  static override targetSchema = 'network.xyo.test'

  static override async create<TParams extends MemoryArchivistParams>(params?: TParams) {
    return (await super.create(params)) as IdentityDiviner<TParams>
  }

  override divine(payloads: XyoPayloads): Promisable<XyoPayloads> {
    return payloads
  }
}
