import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { HttpBridge } from '@xyo-network/http-bridge'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { MemorySentinel } from '@xyo-network/sentinel-memory'

export const standardCreatableModules: CreatableModuleDictionary = {
  'network.xyo.archivist.config': MemoryArchivist,
  'network.xyo.bridge.http.config': ModuleFactory.withParams(HttpBridge, { config: { schema: HttpBridge.configSchema } }),
  'network.xyo.node.config': MemoryNode,
  'network.xyo.sentinel.config': MemorySentinel,
}
