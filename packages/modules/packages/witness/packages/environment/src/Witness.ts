import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

import { EnvironmentWitnessConfigSchema } from './Config'
import { EnvironmentWitnessParams } from './Params'
import { Environment, EnvironmentSchema } from './Payload'

const schema = EnvironmentSchema

export class EnvironmentWitness<P extends EnvironmentWitnessParams = EnvironmentWitnessParams> extends AbstractWitness<P> {
  static override configSchemas = [EnvironmentWitnessConfigSchema, WitnessConfigSchema]
  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    // TODO: Filter to template
    const sources = await PayloadWrapper.hashes(payloads ?? [])
    const env = process.env
    const payload: Environment = { env, schema, sources }
    return [payload]
  }
}
