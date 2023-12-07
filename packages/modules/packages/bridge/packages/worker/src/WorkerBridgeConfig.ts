import { BridgeConfig } from '@xyo-network/bridge-model'
import { EmptyObject } from '@xyo-network/object'

export type WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config'
export const WorkerBridgeConfigSchema: WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config'

export type WorkerBridgeConfig<TConfig extends EmptyObject = EmptyObject> = BridgeConfig<TConfig, WorkerBridgeConfigSchema>
