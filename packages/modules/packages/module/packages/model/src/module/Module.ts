import { EventFunctions } from '@xyo-network/module-events'

import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleEventData } from '../EventsModels'
import { ModuleFields } from './ModuleFields'

export interface Module<
  TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>,
  TEventData extends ModuleEventData<object> = ModuleEventData<object>,
> extends ModuleFields<TConfig>,
    EventFunctions<TEventData> {}
