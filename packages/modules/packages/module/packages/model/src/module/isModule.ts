import { TypeCheck } from '@xylabs/object'
import { Schema } from '@xyo-network/payload-model'

import { ModuleStateQuerySchema } from '../Queries/index.js'
import { IsModuleFactory } from './IsModuleFactory.js'
import { isModuleObject } from './isModuleObject.js'
import { Module } from './Module.js'

export const requiredModuleQueries: Schema[] = [ModuleStateQuerySchema]

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsModuleFactory<Module>()

export const isModule: TypeCheck<Module> = factory.create(requiredModuleQueries, [isModuleObject])
