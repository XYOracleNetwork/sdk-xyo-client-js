import { TypeCheck } from '@xylabs/object'

import { ModuleDiscoverQuerySchema } from '../Queries'
import { IsModuleFactory } from './IsModuleFactory'
import { isModuleObject } from './isModuleObject'
import { Module } from './Module'

export const requiredModuleQueries: string[] = [
  /* We need to update this once live module conform */
  //ModuleDescribeQuerySchema,
  //ModuleAddressQuerySchema,
  ModuleDiscoverQuerySchema,
  //ModuleManifestQuerySchema,
  //ModuleSubscribeQuerySchema,
]

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsModuleFactory<Module>()

export const isModule: TypeCheck<Module> = factory.create(requiredModuleQueries, [isModuleObject])
