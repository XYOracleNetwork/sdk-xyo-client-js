import { MemoryArchivist } from '@xyo-network/archivist'
import { getNode } from '@xyo-network/node-app'

import { getOptionsParser, loadModule } from './lib'
import { startTerminal } from './terminal'

const createNode = async () => {
  const node = await getNode()
  const args = await getOptionsParser()
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

        node.register(await MemoryArchivist.create())

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
    )
    .help().argv
  if (args.daemon) {
    console.log('TODO: Running Node as daemon')
  }
  return node
}

const main = async () => {
  await startTerminal(await createNode())
}

main()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
  })
