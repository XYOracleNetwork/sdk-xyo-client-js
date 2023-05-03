import { Payload } from '@xyo-network/payload-model'
import type {
  SLChemData,
  SLCircuitNamesData,
  SLControllerConfigData,
  SLEquipmentConfigurationData,
  SLEquipmentStateData,
  SLGetCustomNamesData,
  SLIntellichlorData,
  SLPumpStatusData,
  SLScheduleData,
  SLSystemTimeData,
  SLVersionData,
  SLWeatherForecastData,
} from 'node-screenlogic'

import { XyoPentairScreenlogicSchema } from './Schema'

export type XyoPentairScreenlogicPayload = Payload<
  {
    chem: SLChemData
    chlor: SLIntellichlorData
    equipment?: {
      circuitNames?: SLCircuitNamesData
      config?: SLEquipmentConfigurationData
      controllerConfig?: SLControllerConfigData
      customNames?: SLGetCustomNamesData
      state?: SLEquipmentStateData
      systemTime?: SLSystemTimeData
      weatherForecast?: SLWeatherForecastData
    }
    pump?: {
      status: SLPumpStatusData[]
    }
    schedule?: {
      once?: SLScheduleData
      recurring?: SLScheduleData
    }
    version?: SLVersionData
  },
  XyoPentairScreenlogicSchema
>
