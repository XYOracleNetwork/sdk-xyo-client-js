import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

import { TimestampWitnessConfigSchema } from './Config'
import { TimestampWitnessParams } from './Params'
import { TimeStamp, TimestampSchema } from './Payload'

export class TimestampWitness<P extends TimestampWitnessParams = TimestampWitnessParams> extends AbstractWitness<P> {
  static override configSchemas = [TimestampWitnessConfigSchema, WitnessConfigSchema]
  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    const sources = await PayloadWrapper.hashes(payloads ?? [])
    const payload: TimeStamp = { schema: TimestampSchema, sources, timestamp: Date.now() }
    return [payload]
  }
}
