import { HttpBridge } from '@xyo-network/http-bridge'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node-memory'
import { MemorySentinel } from '@xyo-network/sentinel'

export const standardCreatableModules: CreatableModuleDictionary = {
  'network.xyo.archivist.config': MemoryArchivist,
  'network.xyo.bridge.http.config': ModuleFactory.withParams(HttpBridge, { config: { schema: HttpBridge.configSchema } }),
  'network.xyo.node.config': MemoryNode,
  'network.xyo.sentinel.config': MemorySentinel,
}
