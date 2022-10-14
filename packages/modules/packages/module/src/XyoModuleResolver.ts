import { ModuleResolver, ModuleResolverEventFunc } from './ModuleResolver'
import { XyoModule } from './XyoModule'

export class XyoModuleResolver implements ModuleResolver {
  private modules: Record<string, XyoModule> = {}
  private handlers: ModuleResolverEventFunc<XyoModule>[] = []

  public get isModuleResolver() {
    return true
  }

  add(module: XyoModule) {
    this.modules[module.address] = module
    return this
  }

  remove(module: XyoModule) {
    delete this.modules[module.address]
    return this
  }

  fromAddress(addresses: string[]): (XyoModule | null)[] {
    return addresses.map((address) => this.modules[address] ?? null)
  }

  fromQuery(schema: string[]): XyoModule[] {
    return Object.values(this.modules).filter((module) => schema.reduce((prev, schema) => prev && module.queryable(schema), true))
  }

  subscribe(handler: ModuleResolverEventFunc): void {
    this.unsubscribe(handler)
    this.handlers.push(handler)
  }

  unsubscribe(handler: ModuleResolverEventFunc): void {
    this.handlers = this.handlers.filter((item) => item !== handler)
  }
}
