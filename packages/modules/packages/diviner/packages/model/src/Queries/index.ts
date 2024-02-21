export * from './Divine'

import { ModuleQueries } from '@xyo-network/module-model'

import { DivinerDivineQuery } from './Divine'

export type DivinerQueries = DivinerDivineQuery
export type DivinerModuleQueries = ModuleQueries | DivinerQueries
