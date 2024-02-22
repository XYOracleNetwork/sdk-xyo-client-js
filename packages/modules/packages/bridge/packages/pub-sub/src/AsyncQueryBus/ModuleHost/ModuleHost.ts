import { AbstractModuleHost, ModuleHostParams } from '../../AbstractModuleHost'
import { AsyncQueryBusHost } from '../AsyncQueryBusHost'
import { AsyncQueryBusHostConfig } from '../Config'

export type AsyncQueryBusModuleHostParams = ModuleHostParams & {
  config: AsyncQueryBusHostConfig
}

export class AsyncQueryBusModuleHost extends AbstractModuleHost<AsyncQueryBusModuleHostParams> {
  private _busHost?: AsyncQueryBusHost

  constructor(params: AsyncQueryBusModuleHostParams) {
    super(params)
  }

  override async start(): Promise<void> {
    const listeningModules =
      this.params.config.listeningModules ?? (await this.params.module.resolve(undefined, { direction: 'down' })).map((m) => m.address)
    this._busHost = new AsyncQueryBusHost({
      config: { ...this.params.config, listeningModules },
      logger: this.params.logger,
      resolver: this.params.module,
    })
    this._busHost?.start()
  }
  override stop() {
    this._busHost?.stop()
  }
}
