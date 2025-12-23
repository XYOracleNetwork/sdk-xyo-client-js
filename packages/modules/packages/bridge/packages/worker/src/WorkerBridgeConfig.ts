import type { EmptyObject } from '@xylabs/sdk-js'
import type { BridgeConfig } from '@xyo-network/bridge-model'

export const WorkerBridgeConfigSchema = 'network.xyo.bridge.worker.config' as const
export type WorkerBridgeConfigSchema = typeof WorkerBridgeConfigSchema

export type WorkerBridgeConfig<TConfig extends EmptyObject = EmptyObject> = BridgeConfig<TConfig, WorkerBridgeConfigSchema>
