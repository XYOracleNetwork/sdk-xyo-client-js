import type { EmptyObject } from '@xylabs/object'
import type { BridgeConfig } from '@xyo-network/bridge-model'

export type WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config'
export const WorkerBridgeConfigSchema: WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config'

export type WorkerBridgeConfig<TConfig extends EmptyObject = EmptyObject> = BridgeConfig<TConfig, WorkerBridgeConfigSchema>
