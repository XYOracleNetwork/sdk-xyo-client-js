import { delay } from '@xylabs/delay'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams, XyoWitnessConfigSchema } from '@xyo-network/witness'

export class XyoNonFungibleTokenMetaWitness<TParams extends WitnessParams = WitnessParams> extends AbstractWitness<TParams> {
  static override configSchema = XyoWitnessConfigSchema

  override async observe(_payloads?: Payload[]) {
    await delay(0)
    return super.observe([{ schema: 'network.xyo.nft.meta' }])
  }
}
