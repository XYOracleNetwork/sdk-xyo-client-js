import { AbstractModuleHost, ModuleHostParams } from '../../AbstractModuleHost'
import { AsyncQueryBusServer } from '../AsyncQueryBusServer'
import { AsyncQueryBusConfig } from '../Config'

export type AsyncQueryBusModuleHostParams = ModuleHostParams & {
  config: AsyncQueryBusConfig
}

export class AsyncQueryBusModuleHost extends AbstractModuleHost<AsyncQueryBusModuleHostParams> {
  private _busServer?: AsyncQueryBusServer

  constructor(params: AsyncQueryBusModuleHostParams) {
    super(params)
  }

  override async start(): Promise<void> {
    const listeningModules =
      this.params.config.listeningModules ?? (await this.params.module.resolve(undefined, { direction: 'down' })).map((m) => m.address)
    this._busServer = new AsyncQueryBusServer({
      config: { ...this.params.config, listeningModules },
      logger: this.params.logger,
      resolver: this.params.module,
    })
    this._busServer.start()
  }
  override stop() {
    this._busServer?.stop()
  }
}
