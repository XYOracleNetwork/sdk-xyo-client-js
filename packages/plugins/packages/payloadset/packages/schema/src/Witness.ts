import { delay } from '@xylabs/delay'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'
import { AbstractWitness, WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness'

export type XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'
export const XyoSchemaWitnessConfigSchema: XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'

export type XyoSchemaWitnessConfig = WitnessConfig<{ schema: XyoSchemaWitnessConfigSchema }>

export type XyoSchemaWitnessParams = WitnessParams<AnyConfigSchema<XyoSchemaWitnessConfig>>

export class XyoSchemaWitness<TParams extends XyoSchemaWitnessParams = XyoSchemaWitnessParams>
  extends AbstractWitness<TParams>
  implements WitnessModule
{
  static override configSchema = XyoSchemaWitnessConfigSchema

  override async observe(_payloads?: Payload[]): Promise<XyoSchemaPayload[]> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
}
