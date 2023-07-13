import { MemoryNode } from '@xyo-network/node'

export type NodeConfigurationFunction<T = void> = (node: MemoryNode) => Promise<T> | T
