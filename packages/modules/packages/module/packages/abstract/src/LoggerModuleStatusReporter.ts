import type { Logger } from '@xylabs/logger'
import type { ModuleStatus, ModuleStatusReporter } from '@xyo-network/module-model'

export class LoggerModuleStatusReporter implements ModuleStatusReporter {
  private logger: Logger

  private statusMap: Record<string, ModuleStatus> = {}

  constructor(logger: Logger) {
    this.logger = logger
  }

  reportStatus(name: string, status: ModuleStatus, progress?: number): void {
    this.statusMap[name] = status
    const starting = (Object.entries(this.statusMap).map(([, value]): number => value === 'starting' ? 1 : 0)).reduce((a, b) => a + b, 0)
    const started = (Object.entries(this.statusMap).map(([, value]): number => value === 'started' ? 1 : 0)).reduce((a, b) => a + b, 0)
    this.logger.info(`${started}/${starting + started} ${name} status: ${status}`, { progress })
  }
}
