import { ObjectTypeCheck } from '../../identity'
import { ModuleDiscoverQuerySchema } from '../../Queries'
import { Module } from '../Module'
import { IsModuleFactory } from './IsModuleFactory'
import { isModuleObject } from './isModuleObject'

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

export const isModule: ObjectTypeCheck<Module> = factory.create(requiredModuleQueries, [isModuleObject])
