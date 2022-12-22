import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { XyoPentairScreenlogicPayload, XyoPentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { Controller } from './screenlogic'

export type XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'
export const XyoPentairScreenlogicWitnessConfigSchema: XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'

export interface PentairServer {
  address: string

  gatewayName: string
  gatewaySubtype: number
  gatewayType: number

  port: number
  type: number
}

export type XyoPentairScreenlogicWitnessConfig = XyoWitnessConfig<{
  schema: XyoPentairScreenlogicWitnessConfigSchema
}>

export class XyoPentairScreenlogicWitness extends AbstractWitness<XyoPentairScreenlogicWitnessConfig> {
  static override configSchema = XyoPentairScreenlogicWitnessConfigSchema

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected controller = new Controller()

  static override async create(params?: ModuleParams<XyoPentairScreenlogicWitnessConfig>): Promise<XyoPentairScreenlogicWitness> {
    return (await super.create(params)) as XyoPentairScreenlogicWitness
  }

  override async observe(_payloads?: Partial<XyoPayload>[]): Promise<XyoPayload[]> {
    const config = await this.controller.getPoolConfig()
    const status = await this.controller.getPoolStatus()
    return await super.observe([{ config, schema: XyoPentairScreenlogicSchema, status }] as XyoPentairScreenlogicPayload[])
  }
}
