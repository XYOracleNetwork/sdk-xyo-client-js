import { EventFunctions } from '@xyo-network/module-events'

import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleParams } from '../ModuleParams'
import { ModuleEventData } from './ModuleEvents'
import { ModuleFields } from './ModuleFields'

export type Module<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = ModuleFields<TParams> & EventFunctions<TEventData>
