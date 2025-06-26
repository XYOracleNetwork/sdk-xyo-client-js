import type { CreatableParams } from '@xylabs/creatable'
import { BaseEmitter, type EventData } from '@xylabs/events'

export class ModuleBaseEmitter<TParams extends CreatableParams = CreatableParams, TEventData extends EventData = EventData>
  extends BaseEmitter<TParams, TEventData> {}
