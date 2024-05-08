import { ModuleEventData } from '@xyo-network/module-model'

import { ExposedEventData, QueryFinishedEventData, QueryStartedEventData, UnexposedEventData } from './Events'

export interface BridgeModuleEventData extends QueryFinishedEventData, QueryStartedEventData, ExposedEventData, UnexposedEventData, ModuleEventData {}
