import { HttpBridge } from '@xyo-network/http-bridge'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import { MemorySentinel } from '@xyo-network/sentinel'

export const standardCreatableModules: CreatableModuleDictionary = {
  'network.xyo.archivist': MemoryArchivist,
  'network.xyo.bridge.http': ModuleFactory.withParams(HttpBridge, { config: { schema: HttpBridge.configSchema } }),
  'network.xyo.node': MemoryNode,
  'network.xyo.sentinel': MemorySentinel,
}
