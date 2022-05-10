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
  schema: 'network.xyo.system.info.node',
  systeminformation: defaultSystemInfoConfig(),
})

export { defaultSystemInfoConfig, systemInfoNodeWitnessTemplate }
