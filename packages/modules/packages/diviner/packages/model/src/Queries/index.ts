export * from './Divine.ts'

import { ModuleQueries } from '@xyo-network/module-model'

import { DivinerDivineQuery } from './Divine.ts'

export type DivinerQueries = DivinerDivineQuery
export type DivinerModuleQueries = ModuleQueries | DivinerQueries
