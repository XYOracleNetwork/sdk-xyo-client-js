import { delay } from '@xylabs/delay'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfigSchema, WitnessParams } from '@xyo-network/witness'

export class NonFungibleTokenMetaWitness<TParams extends WitnessParams = WitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [WitnessConfigSchema]

  protected override async observeHandler(_payloads?: Payload[]) {
    await delay(0)
    return [{ schema: 'network.xyo.nft.meta' }]
  }
}
