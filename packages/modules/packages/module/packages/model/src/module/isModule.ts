import { TypeCheck } from '@xylabs/object'
import { Schema } from '@xyo-network/payload-model'

import { ModuleStateQuerySchema } from '../Queries/index.ts'
import { IsModuleFactory } from './IsModuleFactory.ts'
import { isModuleObject } from './isModuleObject.ts'
import { Module } from './Module.ts'

export const requiredModuleQueries: Schema[] = [ModuleStateQuerySchema]

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsModuleFactory<Module>()

export const isModule: TypeCheck<Module> = factory.create(requiredModuleQueries, [isModuleObject])
