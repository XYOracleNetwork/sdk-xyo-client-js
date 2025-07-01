import type { CreatableName, CreatableStatus } from '@xylabs/creatable'
import type { Logger } from '@xylabs/logger'
import type { ModuleStatusReporter } from '@xyo-network/module-model'

export class LoggerModuleStatusReporter implements ModuleStatusReporter {
  protected logger: Logger

  protected statusMap: Record<CreatableName, CreatableStatus> = {}

  constructor(logger: Logger) {
    this.logger = logger
  }

  report(name: string, status: CreatableStatus, progress?: number | Error): void {
    this.statusMap[name] = status
    const starting = (Object.entries(this.statusMap).map(([, value]): number => value === 'starting' ? 1 : 0)).reduce((a, b) => a + b, 0)
    const started = (Object.entries(this.statusMap).map(([, value]): number => value === 'started' ? 1 : 0)).reduce((a, b) => a + b, 0)
    this.logger.info(`${started}/${starting + started} ${name} status: ${status}`, { progress })
  }
}
