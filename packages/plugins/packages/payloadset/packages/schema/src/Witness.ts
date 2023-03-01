import { delay } from '@xylabs/delay'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'
import { AbstractWitness, WitnessModule, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'

export type XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'
export const XyoSchemaWitnessConfigSchema: XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'

export type XyoSchemaWitnessConfig = XyoWitnessConfig<{ schema: XyoSchemaWitnessConfigSchema }>

export class XyoSchemaWitness extends AbstractWitness<WitnessParams<XyoSchemaWitnessConfig>> implements WitnessModule {
  static override configSchema = XyoSchemaWitnessConfigSchema

  static override async create(params?: ModuleParams<XyoSchemaWitnessConfig>): Promise<XyoSchemaWitness> {
    return (await super.create(params)) as XyoSchemaWitness
  }

  override async observe(_payloads?: XyoPayload[]): Promise<XyoSchemaPayload[]> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
}
