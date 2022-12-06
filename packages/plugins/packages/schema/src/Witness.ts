import { delay } from '@xylabs/delay'
import { XyoModuleParams } from '@xyo-network/module'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSchemaPayload } from './Payload'

export type XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'
export const XyoSchemaWitnessConfigSchema: XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'

export type XyoSchemaWitnessConfig = XyoWitnessConfig<{ schema: XyoSchemaWitnessConfigSchema }>

export class XyoSchemaWitness extends AbstractWitness<XyoSchemaWitnessConfig> {
  static override configSchema = XyoSchemaWitnessConfigSchema

  static override async create(params?: XyoModuleParams<XyoSchemaWitnessConfig>): Promise<XyoSchemaWitness> {
    return (await super.create(params)) as XyoSchemaWitness
  }

  override async observe(_payloads?: XyoSchemaPayload[]): Promise<XyoSchemaPayload[]> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
}
