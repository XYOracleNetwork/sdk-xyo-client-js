import type { EmptyObject } from '@xylabs/sdk-js'
import type { BridgeConfig } from '@xyo-network/bridge-model'
import { asSchema } from '@xyo-network/payload-model'

export const WorkerBridgeConfigSchema = asSchema('network.xyo.bridge.worker.config', true)
export type WorkerBridgeConfigSchema = typeof WorkerBridgeConfigSchema

export type WorkerBridgeConfig<TConfig extends EmptyObject = EmptyObject> = BridgeConfig<TConfig, WorkerBridgeConfigSchema>
