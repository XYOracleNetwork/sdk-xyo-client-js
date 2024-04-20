import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload, Schema } from '@xyo-network/payload-model'

import { TimestampWitnessConfigSchema } from './Config'
import { TimestampWitnessParams } from './Params'
import { TimeStamp, TimestampSchema } from './Payload'

export class TimestampWitness<P extends TimestampWitnessParams = TimestampWitnessParams> extends AbstractWitness<P> {
  static override configSchemas: Schema[] = [...super.configSchemas, TimestampWitnessConfigSchema]
  static override defaultConfigSchema: Schema = TimestampWitnessConfigSchema
  protected override observeHandler(_payloads?: Payload[]): Promisable<Payload[]> {
    const payload: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    return [payload]
  }
}
