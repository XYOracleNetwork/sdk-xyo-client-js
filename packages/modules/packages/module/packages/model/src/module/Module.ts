import type { CreatableInstance } from '@xylabs/creatable'
import type { EventFunctions } from '@xylabs/events'

import type { ModuleEventData } from '../EventsModels/index.ts'
import type { ModuleParams } from '../ModuleParams.ts'
import type { ModuleFields } from './ModuleFields.ts'

export type Module<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  = ModuleFields<TParams> & EventFunctions<TEventData> & CreatableInstance<TParams, TEventData>
