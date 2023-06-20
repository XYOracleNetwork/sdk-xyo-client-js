import { BridgeConfig } from '@xyo-network/bridge-model'
import { AnyObject } from '@xyo-network/core'

export type WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config'
export const WorkerBridgeConfigSchema: WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config'

export type WorkerBridgeConfig<TConfig extends AnyObject = AnyObject> = BridgeConfig<
  {
    schema: WorkerBridgeConfigSchema
  } & TConfig
>
