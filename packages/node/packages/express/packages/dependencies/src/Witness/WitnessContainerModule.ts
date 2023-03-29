import { Account } from '@xyo-network/account'
import { Module } from '@xyo-network/modules'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { ContainerModule, interfaces } from 'inversify'

let prometheusNodeWitness: PrometheusNodeWitness

const getPrometheusNodeWitness = async (context: interfaces.Context) => {
  if (prometheusNodeWitness) return prometheusNodeWitness
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Witnesses.Prometheus)
  prometheusNodeWitness = await PrometheusNodeWitness.create({
    account,
    config: { name: TYPES.PrometheusWitness.description, schema: PrometheusNodeWitness.configSchema },
  })
  return prometheusNodeWitness
}

export const WitnessContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(PrometheusNodeWitness).toDynamicValue(getPrometheusNodeWitness).inSingletonScope()
  bind<PrometheusNodeWitness>(TYPES.PrometheusWitness).toDynamicValue(getPrometheusNodeWitness).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getPrometheusNodeWitness).inSingletonScope()
})
