import { merge } from '@xylabs/lodash'
import { AnyConfigSchema, Module } from '@xyo-network/module'
import { AbstractModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'

export type AbstractModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'
export const AbstractModuleInstanceWitnessConfigSchema: AbstractModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'

export type AbstractModuleInstanceWitnessConfig = WitnessConfig<{
  schema: AbstractModuleInstanceWitnessConfigSchema
}>

export type AbstractModuleInstanceWitnessParams = WitnessParams<
  AnyConfigSchema<AbstractModuleInstanceWitnessConfig>,
  {
    module?: Module
  }
>

export class AbstractModuleInstanceWitness<
  TParams extends AbstractModuleInstanceWitnessParams = AbstractModuleInstanceWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [AbstractModuleInstanceWitnessConfigSchema]

  protected get module() {
    return this.params?.module
  }

  protected override observeHandler(payloads?: Partial<Payload>[]): Promisable<Payload[]> {
    return [merge({ queries: this.module?.queries }, payloads?.[0], { schema: AbstractModuleInstanceSchema })]
  }
}
