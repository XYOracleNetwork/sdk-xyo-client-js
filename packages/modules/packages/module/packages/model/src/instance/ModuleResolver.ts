import { ResolveFunctions } from './ResolveFunctions'

export interface ModuleResolver extends ResolveFunctions {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
}
