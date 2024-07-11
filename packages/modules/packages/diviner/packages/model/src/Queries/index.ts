export * from './Divine.js'

import { ModuleQueries } from '@xyo-network/module-model'

import { DivinerDivineQuery } from './Divine.js'

export type DivinerQueries = DivinerDivineQuery
export type DivinerModuleQueries = ModuleQueries | DivinerQueries
