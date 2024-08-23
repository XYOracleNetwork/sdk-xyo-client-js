import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { DivinerInstance } from '@xyo-network/diviner-model'
import type { ModuleInstance } from '@xyo-network/module-model'
import type { WitnessInstance } from '@xyo-network/witness-model'

import type {
  ArchivistTask, DivinerTask, ModuleTask, WitnessTask,
} from './Task.ts'

export type ResolvedModuleTask<TTask extends ModuleTask = ModuleTask, TInstance extends ModuleInstance = ModuleInstance> = Omit<TTask, 'mod'> & {
  /** @field the modules that performs the task */
  mod: TInstance
}

export type ResolvedArchivistTask = ResolvedModuleTask<ArchivistTask, ArchivistInstance>
export type ResolvedDivinerTask = ResolvedModuleTask<DivinerTask, DivinerInstance>
export type ResolvedWitnessTask = ResolvedModuleTask<WitnessTask, WitnessInstance>

export type ResolvedTask = ResolvedArchivistTask | ResolvedDivinerTask | ResolvedWitnessTask | ResolvedModuleTask
