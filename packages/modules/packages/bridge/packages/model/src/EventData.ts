import { ModuleEventData } from '@xyo-network/module-model'

import {
  ExposedEventData,
  QueryFulfillFinishedEventData,
  QueryFulfillStartedEventData,
  QuerySendFinishedEventData,
  QuerySendStartedEventData,
  UnexposedEventData,
} from './Events'

export interface BridgeModuleEventData
  extends QuerySendFinishedEventData,
    QuerySendStartedEventData,
    QueryFulfillFinishedEventData,
    QueryFulfillStartedEventData,
    ExposedEventData,
    UnexposedEventData,
    ModuleEventData {}
