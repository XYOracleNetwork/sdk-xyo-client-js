import type { Module } from '@xyo-network/module-model'
import type { MongoDBModuleParams } from '@xyo-network/module-model-mongodb'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAbstractModule = abstract new (...args: any[]) => Module<MongoDBModuleParams>
