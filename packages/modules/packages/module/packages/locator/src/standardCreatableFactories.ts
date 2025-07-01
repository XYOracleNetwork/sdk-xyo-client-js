import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ViewArchivist } from '@xyo-network/archivist-view'
import { HttpBridge } from '@xyo-network/bridge-http'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { IdentityDiviner } from '@xyo-network/diviner-identity'
import { GenericPayloadDiviner } from '@xyo-network/diviner-payload-generic'
import type { CreatableModuleFactory, LabeledCreatableModuleFactory } from '@xyo-network/module-model'
import { registerCreatableModuleFactories } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { ViewNode } from '@xyo-network/node-view'
import { MemorySentinel } from '@xyo-network/sentinel-memory'
import { AdhocWitness } from '@xyo-network/witness-adhoc'

// order matters in this array.  later items will register themselves as primary for schemas shared with earlier items
export const standardCreatableModulesList: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] = [
  HttpBridge.factory(),
  ViewArchivist.factory(),
  ViewNode.factory(),
  AdhocWitness.factory(),
  GenericPayloadDiviner.factory(),
  MemoryBoundWitnessDiviner.factory(),
  IdentityDiviner.factory(),
  MemoryArchivist.factory(),
  MemoryArchivist.factory(),
  MemoryNode.factory(),
  MemorySentinel.factory(),
  GenericPayloadDiviner.factory(),
]

export const standardCreatableFactories = () => {
  return registerCreatableModuleFactories(standardCreatableModulesList, {}, true)
}
