import { delay } from '@xylabs/delay'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness, XyoWitnessConfig, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoNonFungibleTokenMetaPayload } from './MetaPayload'

export class XyoNonFungibleTokenMetaWitness extends XyoWitness<XyoNonFungibleTokenMetaPayload> {
  static override async create(params?: XyoModuleParams<XyoWitnessConfig>): Promise<XyoNonFungibleTokenMetaWitness> {
    return (await super.create(params)) as XyoNonFungibleTokenMetaWitness
  }

  override async observe(_fields?: Partial<XyoNonFungibleTokenMetaPayload>[]) {
    await delay(0)
    return super.observe([{ schema: 'network.xyo.nft.meta' }])
  }

  static override configSchema = XyoWitnessConfigSchema
  static override targetSchema = 'network.xyo.nft.meta'
}
