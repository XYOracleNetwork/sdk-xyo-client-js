import { XyoMemoryArchivist } from '@xyo-network/archivist'
import { ModuleResolver, XyoModule } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { startTerminal } from './terminal'

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

const loadModule = async (pkg: string, name?: string, resolver?: ModuleResolver): Promise<XyoModule> => {
  const loadedPkg = await import(pkg)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ModuleConstructor: any = name ? loadedPkg[name] : loadedPkg
  return new ModuleConstructor(undefined, undefined, resolver)
}

const xyo = async () => {
  const node = await MemoryNode.create()
  node.register(await XyoMemoryArchivist.create())
  await parseOptions().command(
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

      node.register(await XyoMemoryArchivist.create())

      await Promise.all(
        modules.map(async (module) => {
          const [pkg, name] = module.split('.')
          const instance = await loadModule(pkg, name, node)
          console.log(`Arg: ${instance.address}`)
          node.register(instance)
          node.attach(instance.address)

          console.log(`Module Loaded: ${instance.address}`)
        }),
      )
    },
  ).argv
  return node
}

const start = async () => {
  await startTerminal(await xyo())
}

start()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
  })
