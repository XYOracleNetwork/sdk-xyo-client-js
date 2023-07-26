import { EventFunctions } from '@xyo-network/module-events'

import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleEventData } from '../Events'
import { ModuleParams } from '../ModuleParams'
import { ModuleFields } from './ModuleFields'

export type Module<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData<object> = ModuleEventData<object>,
> = ModuleFields<TParams> & EventFunctions<TEventData>
