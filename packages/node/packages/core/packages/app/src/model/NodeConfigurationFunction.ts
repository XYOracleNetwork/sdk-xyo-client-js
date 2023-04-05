import { MemoryNode } from '@xyo-network/modules'

export type NodeConfigurationFunction<T = void> = (node: MemoryNode) => Promise<T> | T
