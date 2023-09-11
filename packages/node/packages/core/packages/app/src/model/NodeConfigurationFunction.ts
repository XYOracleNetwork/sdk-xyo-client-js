import { MemoryNode } from '@xyo-network/node-memory'

export type NodeConfigurationFunction<T = void> = (node: MemoryNode) => Promise<T> | T
