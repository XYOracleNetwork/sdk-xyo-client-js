import { TypeCheck } from '@xylabs/object'
import { Schema } from '@xyo-network/payload-model'

import { ModuleStateQuerySchema } from '../Queries'
import { IsModuleFactory } from './IsModuleFactory'
import { isModuleObject } from './isModuleObject'
import { Module } from './Module'

export const requiredModuleQueries: Schema[] = [ModuleStateQuerySchema]

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsModuleFactory<Module>()

export const isModule: TypeCheck<Module> = factory.create(requiredModuleQueries, [isModuleObject])
