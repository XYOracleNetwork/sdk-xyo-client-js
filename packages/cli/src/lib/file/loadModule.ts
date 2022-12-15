import { AbstractModule, ModuleResolver } from '@xyo-network/module'

export const loadModule = async (pkg: string, name?: string, resolver?: ModuleResolver): Promise<AbstractModule> => {
  const loadedPkg = await import(pkg)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ModuleConstructor: any = name ? loadedPkg[name] : loadedPkg
  return new ModuleConstructor(undefined, undefined, resolver)
}
