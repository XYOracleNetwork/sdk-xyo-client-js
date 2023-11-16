import { ArchivistInstance } from '@xyo-network/archivist-model'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { ModuleInstance } from '@xyo-network/module-model'
import { WitnessInstance } from '@xyo-network/witness-model'

import { ArchivistTask, DivinerTask, ModuleTask, WitnessTask } from './Task'

export type ResolvedModuleTask<TTask extends ModuleTask = ModuleTask, TInstance extends ModuleInstance = ModuleInstance> = Omit<TTask, 'module'> & {
  /** @field the modules that performs the task */
  module: TInstance
}

export type ResolvedArchivistTask = ResolvedModuleTask<ArchivistTask, ArchivistInstance>
export type ResolvedDivinerTask = ResolvedModuleTask<DivinerTask, DivinerInstance>
export type ResolvedWitnessTask = ResolvedModuleTask<WitnessTask, WitnessInstance>

export type ResolvedTask = ResolvedArchivistTask | ResolvedDivinerTask | ResolvedWitnessTask | ResolvedModuleTask
