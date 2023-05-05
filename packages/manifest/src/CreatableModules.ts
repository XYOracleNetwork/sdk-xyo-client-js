import { HttpBridge } from '@xyo-network/http-bridge'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { CreatableModule } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import { MemorySentinel } from '@xyo-network/sentinel'

export interface CreatableModuleDictionary {
  [key: string]: CreatableModule
}

export const standardCreatableModules: CreatableModuleDictionary = {
  'network.xyo.archivist': MemoryArchivist,
  'network.xyo.bridge.http': HttpBridge,
  'network.xyo.node': MemoryNode,
  'network.xyo.sentinel': MemorySentinel,
}
