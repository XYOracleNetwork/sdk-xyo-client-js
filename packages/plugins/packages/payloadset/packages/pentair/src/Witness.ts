import { assertEx } from '@xylabs/assert'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { XyoPentairScreenlogicPayload, XyoPentairScreenlogicSchema } from '@xyo-network/pentair-payload-plugin'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'
import { FindUnits, SchedTypes, screenlogic } from 'node-screenlogic'

export type XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'
export const XyoPentairScreenlogicWitnessConfigSchema: XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'

export type XyoPentairScreenlogicWitnessConfig = WitnessConfig<{
  schema: XyoPentairScreenlogicWitnessConfigSchema
}>

export type XyoPentairScreenlogicWitnessParams = WitnessParams<AnyConfigSchema<XyoPentairScreenlogicWitnessConfig>>

export class XyoPentairScreenlogicWitness<
  TParams extends XyoPentairScreenlogicWitnessParams = XyoPentairScreenlogicWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = XyoPentairScreenlogicWitnessConfigSchema

  override async observe(_payloads?: Partial<Payload>[]): Promise<Payload[]> {
    const finder = new FindUnits()
    const localUnit = assertEx((await finder.searchAsync()).shift(), 'No local screenlogic unit found')
    screenlogic.initUnit(localUnit)
    assertEx(await screenlogic.connectAsync(), 'Failed to connect to ScreenLogic')

    return await super.observe([
      {
        chem: await screenlogic.chem.getChemicalDataAsync(),
        chlor: await screenlogic.chlor.getIntellichlorConfigAsync(),
        equipment: {
          circuitNames: await screenlogic.equipment.getAllCircuitNamesAsync(),
          config: await screenlogic.equipment.getEquipmentConfigurationAsync(),
          controllerConfig: await screenlogic.equipment.getControllerConfigAsync(),
          customNames: await screenlogic.equipment.getCustomNamesAsync(),
          state: await screenlogic.equipment.getEquipmentStateAsync(),
          systemTime: await screenlogic.equipment.getSystemTimeAsync(),
          weatherForecast: await screenlogic.equipment.getWeatherForecastAsync(),
        },
        schedule: {
          once: await screenlogic.schedule.getScheduleDataAsync(SchedTypes.RUNONCE),
          recurring: await screenlogic.schedule.getScheduleDataAsync(SchedTypes.RECURRING),
        },
        schema: XyoPentairScreenlogicSchema,
        version: await screenlogic.getVersionAsync(),
      },
    ] as XyoPentairScreenlogicPayload[])
  }
}
