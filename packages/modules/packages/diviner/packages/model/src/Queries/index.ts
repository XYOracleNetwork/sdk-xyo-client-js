export * from './Divine.ts'

import type { ModuleQueries } from '@xyo-network/module-model'

import type { DivinerDivineQuery } from './Divine.ts'

export type DivinerQueries = DivinerDivineQuery
export type DivinerModuleQueries = ModuleQueries | DivinerQueries
