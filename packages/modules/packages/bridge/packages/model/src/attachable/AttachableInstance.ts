import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'

import { BridgeInstance, BridgeModule, BridgeModuleEventData, BridgeParams } from '../Bridge'

export interface AttachableBridgeInstance<
  TParams extends BridgeParams = BridgeParams,
  TEventData extends BridgeModuleEventData = BridgeModuleEventData,
> extends BridgeModule<TParams, TEventData>,
    AttachableModuleInstance<TParams, TEventData>,
    BridgeInstance<TParams, TEventData> {}

export type AttachableBridgeInstanceTypeCheck<T extends AttachableBridgeInstance = AttachableBridgeInstance> = TypeCheck<T>

export class IsAttachableBridgeInstanceFactory<T extends AttachableBridgeInstance = AttachableBridgeInstance> extends IsObjectFactory<T> {}
