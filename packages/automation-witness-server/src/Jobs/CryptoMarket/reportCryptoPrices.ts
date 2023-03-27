import { MemoryNode } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { MemorySentinel, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'
import { getProvider } from '../../Providers'
import { getCryptoMarketWitness } from '../../Witnesses'

export const reportCryptoPrices = async (provider = getProvider()): Promise<Payload[]> => {
  const account = getAccount(WalletPaths.CryptoMarketWitnessPanel)
  const archivists = await getArchivists()
  const witnesses = await getCryptoMarketWitness(provider)
  const modules = [...archivists, ...witnesses]
  const node = await MemoryNode.create()
  await Promise.all(
    modules.map(async (mod) => {
      await node.register(mod).attach(mod.address)
    }),
  )
  const config: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  const sentinel = await MemorySentinel.create({ account, config })
  const report = await sentinel.report()
  return report
}
