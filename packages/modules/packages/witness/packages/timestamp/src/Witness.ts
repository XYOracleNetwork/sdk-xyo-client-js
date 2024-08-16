import type { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import type { Payload, Schema } from '@xyo-network/payload-model'

import { TimestampWitnessConfigSchema } from './Config.ts'
import type { TimestampWitnessParams } from './Params.ts'
import type { TimeStamp } from './Payload.ts'
import { TimestampSchema } from './Payload.ts'

export class TimestampWitness<P extends TimestampWitnessParams = TimestampWitnessParams> extends AbstractWitness<P> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, TimestampWitnessConfigSchema]
  static override readonly defaultConfigSchema: Schema = TimestampWitnessConfigSchema
  protected override observeHandler(_payloads?: Payload[]): Promisable<Payload[]> {
    const payload: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    return [payload]
  }
}
