import { XyoApiConfig } from '@xyo-network/api-models'
import { EmptyObject } from '@xyo-network/core'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { AbstractModuleConfigSchema } from '@xyo-network/module'
import { ArchivistWrapper } from '@xyo-network/modules'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { ModuleArguments } from '../ModuleArguments'

type Arguments = ModuleArguments & {
  hashes: string[]
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs
    .usage('Usage: $0 archivist get <address> <hashes..>')
    .positional('address', { demandOption: true, type: 'string' })
    .positional('hashes', { array: true, demandOption: true, type: 'string' })
    .version(false)

export const command = 'get <address> <hashes..>'
export const deprecated = false
export const describe = 'Get payload(s) from the Archivist by hash'
export const handler = async (argv: ArgumentsCamelCase<Arguments>) => {
  const { address, hashes, verbose } = argv
  try {
    const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
    const module = await HttpProxyModule.create({ address, apiConfig, config: { schema: AbstractModuleConfigSchema } })
    const archivist = new ArchivistWrapper(module)
    const result = await archivist.get(hashes)
    console.log(result)
  } catch (error) {
    if (verbose) console.error(error)
  }
  return
}

const mod: CommandModule<EmptyObject, Arguments> = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod
