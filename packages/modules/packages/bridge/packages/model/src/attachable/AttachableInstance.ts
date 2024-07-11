import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'

import { BridgeModuleEventData } from '../EventData.js'
import { BridgeInstance } from '../Instance.js'
import { BridgeModule } from '../Module.js'
import { BridgeParams } from '../Params.js'

export interface AttachableBridgeInstance<
  TParams extends BridgeParams = BridgeParams,
  TEventData extends BridgeModuleEventData = BridgeModuleEventData,
> extends BridgeModule<TParams, TEventData>,
    AttachableModuleInstance<TParams, TEventData>,
    BridgeInstance<TParams, TEventData> {}

export type AttachableBridgeInstanceTypeCheck<T extends AttachableBridgeInstance = AttachableBridgeInstance> = TypeCheck<T>

export class IsAttachableBridgeInstanceFactory<T extends AttachableBridgeInstance = AttachableBridgeInstance> extends IsObjectFactory<T> {}
