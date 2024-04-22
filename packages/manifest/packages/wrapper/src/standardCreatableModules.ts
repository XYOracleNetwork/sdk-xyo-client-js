import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { ViewArchivist } from '@xyo-network/archivist-view'
import { BridgeConfigSchema } from '@xyo-network/bridge-model'
import { IdentityDiviner } from '@xyo-network/diviner-identity'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { HttpBridge } from '@xyo-network/http-bridge'
import {
  CreatableModuleFactory,
  LabeledCreatableModuleFactory,
  registerCreatableModuleFactories,
  registerPrimaryCreatableModuleFactory,
} from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { ViewNode } from '@xyo-network/node-view'
import { MemorySentinel } from '@xyo-network/sentinel-memory'
import { SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AdhocWitness } from '@xyo-network/witness-adhoc'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

export const standardCreatableFactoriesList: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] = [
  MemoryArchivist,
  HttpBridge,
  MemoryArchivist,
  MemoryNode,
  MemorySentinel,
  ViewArchivist,
  ViewNode,
  AdhocWitness,
]

export const standardCreatableFactories = () => {
  const registry = registerCreatableModuleFactories(standardCreatableFactoriesList)
  registerPrimaryCreatableModuleFactory(registry, MemoryNode, NodeConfigSchema)
  registerPrimaryCreatableModuleFactory(registry, MemoryArchivist, ArchivistConfigSchema)
  registerPrimaryCreatableModuleFactory(registry, MemorySentinel, SentinelConfigSchema)
  registerPrimaryCreatableModuleFactory(registry, AdhocWitness, WitnessConfigSchema)
  registerPrimaryCreatableModuleFactory(registry, IdentityDiviner, DivinerConfigSchema)
  registerPrimaryCreatableModuleFactory(registry, HttpBridge, BridgeConfigSchema)
  return registry
}
