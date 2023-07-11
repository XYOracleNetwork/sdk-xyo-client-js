import { AnyConfigSchema, Module } from '@xyo-network/module'
import { AbstractModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'
import merge from 'lodash/merge'

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

  protected override async observeHandler(payloads?: Partial<Payload>[]): Promise<Payload[]> {
    return await super.observe([merge({ queries: this.module?.queries }, payloads?.[0], { schema: AbstractModuleInstanceSchema })])
  }
}
