import { CompositeModuleResolver } from './CompositeModuleResolver'
export * from './ResolverEventEmitter'

/** @deprecated use ModuleResolver */
class SimpleModuleResolver extends CompositeModuleResolver {}

// eslint-disable-next-line deprecation/deprecation
export { CompositeModuleResolver, SimpleModuleResolver }
