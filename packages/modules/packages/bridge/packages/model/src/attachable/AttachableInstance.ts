import type { TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import type { AttachableModuleInstance } from '@xyo-network/module-model'

import type { BridgeModuleEventData } from '../EventData.ts'
import type { BridgeInstance } from '../Instance.ts'
import type { BridgeModule } from '../Module.ts'
import type { BridgeParams } from '../Params.ts'

export interface AttachableBridgeInstance<
  TParams extends BridgeParams = BridgeParams,
  TEventData extends BridgeModuleEventData = BridgeModuleEventData,
> extends BridgeModule<TParams, TEventData>,
  AttachableModuleInstance<TParams, TEventData>,
  BridgeInstance<TParams, TEventData> {}

export type AttachableBridgeInstanceTypeCheck<T extends AttachableBridgeInstance = AttachableBridgeInstance> = TypeCheck<T>

export class IsAttachableBridgeInstanceFactory<T extends AttachableBridgeInstance = AttachableBridgeInstance> extends IsObjectFactory<T> {}
