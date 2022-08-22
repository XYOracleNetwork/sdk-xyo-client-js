import { XyoSystemInfoPayloadSchema } from '../shared'

const defaultSystemInfoConfig = () => {
  return {
    audio: '*',
    battery: '*',
    bluetooth: '*',
    cpu: '*',
    diskLayout: '*',
    graphics: '*',
    mem: '*',
    networkInterfaces: '*',
    osInfo: '*',
    printer: '*',
    system: '*',
    usb: '*',
    wifiInterfaces: '*',
  }
}

const systemInfoNodeWitnessTemplate = () => ({
  schema: XyoSystemInfoPayloadSchema,
  systeminformation: defaultSystemInfoConfig(),
})

export { defaultSystemInfoConfig, systemInfoNodeWitnessTemplate }
