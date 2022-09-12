import { XyoModule, XyoModuleResolverFunc } from '@xyo-network/module'
import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { XyoMemoryNode } from './MemoryNode'

const parseOptions = () => {
  return yargs(hideBin(process.argv))
    .option('verbose', {
      alias: 'v',
      default: false,
      description: 'Run with verbose logging',
      type: 'boolean',
    })
    .option('module', {
      alias: 'm',

      description: 'Modules to load',
      type: 'string',
    })
}

const loadModule = async (pkg: string, name?: string, resolver?: XyoModuleResolverFunc): Promise<XyoModule> => {
  const loadedPkg = await import(pkg)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ModuleConstructor: any = name ? loadedPkg[name] : loadedPkg
  return new ModuleConstructor(undefined, undefined, resolver)
}

const xyo = () => {
  return parseOptions()
    .command(
      'node',
      'Start an XYO Node',
      (yargs) => {
        return yargs
      },
      async (yargs) => {
        console.log(`yargs: ${JSON.stringify(yargs, null, 2)}`)
        const { verbose, module } = yargs
        const modules = Array.isArray(module) ? module : [module]
        if (verbose) console.info('Starting Node')

        const node = new XyoMemoryNode()

        const resolver: XyoModuleResolverFunc = (address: string) => {
          console.log(`Resolving: ${address}`)
          return node.resolve(address)
        }

        await Promise.all(
          modules.map(async (module) => {
            const [pkg, name] = module.split('.')
            const instance = await loadModule(pkg, name, resolver)
            console.log(`Arg: ${instance.address}`)
            node.register(instance)
            node.attach(instance.address)

            console.log(`Module Loaded: ${instance.address}`)
          }),
        )
      },
    )
    .help().argv
}

void xyo()
