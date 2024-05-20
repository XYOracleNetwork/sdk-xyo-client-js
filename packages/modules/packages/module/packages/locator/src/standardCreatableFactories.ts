import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ViewArchivist } from '@xyo-network/archivist-view'
import { HttpBridge } from '@xyo-network/bridge-http'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { IdentityDiviner } from '@xyo-network/diviner-identity'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { CreatableModuleFactory, LabeledCreatableModuleFactory, registerCreatableModuleFactories } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { ViewNode } from '@xyo-network/node-view'
import { MemorySentinel } from '@xyo-network/sentinel-memory'
import { AdhocWitness } from '@xyo-network/witness-adhoc'

//order matters in this array.  later items will register themselves as primary for schemas shared with earlier items
export const standardCreatableFactoriesList: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] = [
  HttpBridge,
  ViewArchivist,
  ViewNode,
  AdhocWitness,
  MemoryPayloadDiviner,
  MemoryBoundWitnessDiviner,
  IdentityDiviner,
  MemoryArchivist,
  MemoryArchivist,
  MemoryNode,
  MemorySentinel,
]

export const standardCreatableFactories = () => {
  return registerCreatableModuleFactories(standardCreatableFactoriesList, {}, true)
}
