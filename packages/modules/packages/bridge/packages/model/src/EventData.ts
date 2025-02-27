import type { ModuleEventData } from '@xyo-network/module-model'

import type {
  ExposedEventData,
  QueryFulfillFinishedEventData,
  QueryFulfillStartedEventData,
  QuerySendFinishedEventData,
  QuerySendStartedEventData,
  UnexposedEventData,
} from './Events/index.ts'

export interface BridgeModuleEventData
  extends QuerySendFinishedEventData,
  QuerySendStartedEventData,
  QueryFulfillFinishedEventData,
  QueryFulfillStartedEventData,
  ExposedEventData,
  UnexposedEventData,
  ModuleEventData {}
