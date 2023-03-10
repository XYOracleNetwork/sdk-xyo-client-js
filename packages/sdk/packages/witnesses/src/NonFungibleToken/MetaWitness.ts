import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams, XyoWitnessConfigSchema } from '@xyo-network/witness'

export class XyoNonFungibleTokenMetaWitness<TParams extends WitnessParams = WitnessParams> extends AbstractWitness<TParams> {
  static override configSchema = XyoWitnessConfigSchema

  static override async create<TParams extends WitnessParams = WitnessParams>(params?: TParams) {
    return (await super.create(params)) as XyoNonFungibleTokenMetaWitness<TParams>
  }

  override async observe(_payloads?: XyoPayload[]) {
    await delay(0)
    return super.observe([{ schema: 'network.xyo.nft.meta' }])
  }
}
