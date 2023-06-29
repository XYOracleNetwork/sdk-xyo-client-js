import { delay } from '@xylabs/delay'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfigSchema, WitnessParams } from '@xyo-network/witness'

export class NonFungibleTokenMetaWitness<TParams extends WitnessParams = WitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [WitnessConfigSchema]

  override async observe(_payloads?: Payload[]) {
    await delay(0)
    return super.observe([{ schema: 'network.xyo.nft.meta' }])
  }
}
