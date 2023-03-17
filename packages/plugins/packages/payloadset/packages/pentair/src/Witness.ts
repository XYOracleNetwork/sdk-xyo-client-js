import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { XyoPentairScreenlogicPayload, XyoPentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'
import { AbstractWitness, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'

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

export type XyoPentairScreenlogicWitnessParams = WitnessParams<AnyConfigSchema<XyoPentairScreenlogicWitnessConfig>>

export class XyoPentairScreenlogicWitness<
  TParams extends XyoPentairScreenlogicWitnessParams = XyoPentairScreenlogicWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = XyoPentairScreenlogicWitnessConfigSchema

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected controller = new Controller()

  override async observe(_payloads?: Partial<Payload>[]): Promise<Payload[]> {
    const config = await this.controller.getPoolConfig()
    const status = await this.controller.getPoolStatus()
    return await super.observe([{ config, schema: XyoPentairScreenlogicSchema, status }] as XyoPentairScreenlogicPayload[])
  }
}
