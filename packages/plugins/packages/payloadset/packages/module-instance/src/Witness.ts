import { AbstractModule, ModuleParams } from '@xyo-network/module'
import { AbstractModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

export type AbstractModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'
export const AbstractModuleInstanceWitnessConfigSchema: AbstractModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'

export type AbstractModuleInstanceWitnessConfig = XyoWitnessConfig<{
  module?: AbstractModule
  schema: AbstractModuleInstanceWitnessConfigSchema
}>

export class AbstractModuleInstanceWitness extends AbstractWitness<AbstractModuleInstanceWitnessConfig> {
  static override configSchema = AbstractModuleInstanceWitnessConfigSchema

  protected get module() {
    return this.config?.module
  }

  static override async create(params?: ModuleParams<AbstractModuleInstanceWitnessConfig>): Promise<AbstractModuleInstanceWitness> {
    return (await super.create(params)) as AbstractModuleInstanceWitness
  }

  override async observe(payloads?: Partial<XyoPayload>[]): Promise<XyoPayload[]> {
    return await super.observe([merge({ queries: this.module?.queries }, payloads?.[0], { schema: AbstractModuleInstanceSchema })])
  }
}
