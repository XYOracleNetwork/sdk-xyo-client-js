import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { ViewArchivist, ViewArchivistConfigSchema } from '@xyo-network/archivist-view'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { ViewNode, ViewNodeConfigSchema } from '@xyo-network/node-view'
import { MemorySentinel } from '@xyo-network/sentinel-memory'
import { SentinelConfigSchema } from '@xyo-network/sentinel-model'

export const standardCreatableModules: CreatableModuleDictionary = {
  [ArchivistConfigSchema]: MemoryArchivist,
  [HttpBridgeConfigSchema]: ModuleFactory.withParams(HttpBridge, { config: { schema: HttpBridgeConfigSchema } }),
  [MemoryArchivistConfigSchema]: MemoryArchivist,
  [NodeConfigSchema]: MemoryNode,
  [SentinelConfigSchema]: MemorySentinel,
  [ViewArchivistConfigSchema]: ViewArchivist,
  [ViewNodeConfigSchema]: ViewNode,
}
