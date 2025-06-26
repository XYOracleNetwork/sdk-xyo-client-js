import type { CreatableInstance, CreatableStatus } from '@xylabs/creatable'

import type { ModuleEventData } from '../EventsModels/index.ts'
import type { ModuleParams } from '../ModuleParams.ts'
import type { ModuleFields } from './ModuleFields.ts'
import { EventData } from '@xylabs/events'

export type ModuleStatus = CreatableStatus | 'dead' | 'wrapped'

export type Module<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  = CreatableInstance<ModuleFields<TParams>, TParams, TEventData>

type X = CreatableInstance<ModuleFields<ModuleParams>, {config: {}}, EventData>

type Y = X['params']['config']