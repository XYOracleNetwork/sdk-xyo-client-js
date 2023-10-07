import { delay } from '@xylabs/delay'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfigSchema, WitnessParams } from '@xyo-network/witness-model'

export class NonFungibleTokenMetaWitness<TParams extends WitnessParams = WitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [WitnessConfigSchema]

  protected override async observeHandler(_payloads?: Payload[]) {
    await delay(0)
    return [{ schema: 'network.xyo.nft.meta' }]
  }
}
