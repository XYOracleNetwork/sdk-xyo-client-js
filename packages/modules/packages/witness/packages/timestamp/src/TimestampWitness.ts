import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { WitnessParams } from '@xyo-network/witness-model'

export abstract class TimestampWitness<P extends WitnessParams = WitnessParams> extends AbstractWitness<P> {
  protected override observeHandler(fields?: Payload[]): Promisable<Payload[]> {
    return (
      fields?.map((fieldItem) => {
        return { ...fieldItem, timestamp: Date.now() }
      }) ?? []
    )
  }
}
