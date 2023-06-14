import { delay } from '@xylabs/delay'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { SchemaPayload } from '@xyo-network/schema-payload-plugin'
import { AbstractWitness, WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness'

export type SchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'
export const SchemaWitnessConfigSchema: SchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'

export type SchemaWitnessConfig = WitnessConfig<{ schema: SchemaWitnessConfigSchema }>

export type SchemaWitnessParams = WitnessParams<AnyConfigSchema<SchemaWitnessConfig>>

export class SchemaWitness<TParams extends SchemaWitnessParams = SchemaWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override configSchema = SchemaWitnessConfigSchema

  override async observe(_payloads?: Payload[]): Promise<SchemaPayload[]> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
}
