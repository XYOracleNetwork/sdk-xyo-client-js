import { delay } from '@xylabs/delay'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, XyoWitnessConfig, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoNonFungibleTokenMetaPayload } from './MetaPayload'

export class XyoNonFungibleTokenMetaWitness extends AbstractWitness<XyoNonFungibleTokenMetaPayload> {
  static override configSchema = XyoWitnessConfigSchema

  static override async create(params?: ModuleParams<XyoWitnessConfig>): Promise<XyoNonFungibleTokenMetaWitness> {
    return (await super.create(params)) as XyoNonFungibleTokenMetaWitness
  }

  override async observe(_payloads?: XyoPayload[]) {
    await delay(0)
    return super.observe([{ schema: 'network.xyo.nft.meta' }])
  }
}
