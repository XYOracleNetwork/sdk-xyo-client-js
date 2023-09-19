import { EventFunctions } from '@xyo-network/module-events'

import { ModuleEventData } from '../EventsModels'
import { ModuleParams } from '../ModuleParams'
import { ModuleFields } from './ModuleFields'

export type Module<
  TParams extends ModuleParams = ModuleParams,
  TEventData extends ModuleEventData<object> = ModuleEventData<object>,
> = ModuleFields<TParams> & EventFunctions<TEventData>
