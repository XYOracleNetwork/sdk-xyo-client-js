import { delay } from '@xylabs/delay'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { SchemaPayload } from '@xyo-network/schema-payload-plugin'
import { WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness-model'

export type SchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'
export const SchemaWitnessConfigSchema: SchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'

export type SchemaWitnessConfig = WitnessConfig<{ schema: SchemaWitnessConfigSchema }>

export type SchemaWitnessParams = WitnessParams<AnyConfigSchema<SchemaWitnessConfig>>

export class SchemaWitness<TParams extends SchemaWitnessParams = SchemaWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override configSchemas = [SchemaWitnessConfigSchema]

  protected override async observeHandler(_payloads?: Payload[]): Promise<SchemaPayload[]> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
}
