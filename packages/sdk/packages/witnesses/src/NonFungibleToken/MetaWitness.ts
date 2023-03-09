import { delay } from '@xylabs/delay'
import { ModuleParamsWithOptionalConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams, XyoWitnessConfigSchema } from '@xyo-network/witness'

export class XyoNonFungibleTokenMetaWitness extends AbstractWitness<WitnessParams> {
  static override configSchema = XyoWitnessConfigSchema

  static override async create<TParams extends WitnessParams = WitnessParams>(params?: ModuleParamsWithOptionalConfigSchema<TParams>) {
    return await super.create(params)
  }

  override async observe(_payloads?: XyoPayload[]) {
    await delay(0)
    return super.observe([{ schema: 'network.xyo.nft.meta' }])
  }
}
