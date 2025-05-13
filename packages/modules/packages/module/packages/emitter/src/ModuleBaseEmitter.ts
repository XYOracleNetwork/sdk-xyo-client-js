import type { BaseParams } from '@xylabs/base'
import type { EventData } from '@xylabs/events'

import { BaseEmitter } from './BaseEmitter.ts'

export class ModuleBaseEmitter<TParams extends BaseParams = BaseParams, TEventData extends EventData = EventData>
  extends BaseEmitter<TParams, TEventData> {}
