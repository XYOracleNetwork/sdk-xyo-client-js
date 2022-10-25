declare module 'node-screenlogic' {
  declare class EventEmitter {
    eventNames(): string[]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on<T>(event: string, func: (data: T) => void)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once<T>(event: string, func: (data: T) => void)
  }

  declare class FindUnits extends EventEmitter {
    constructor()

    close()

    foundServer(msg, remote)

    search()

    sendServerBroadcast()
  }

  declare class RemoteLogin extends EventEmitter {
    constructor(systemName)
    close()

    connect()

    onClientMessage(msg)

    onConnected()
  }

  declare class UnitConnection extends EventEmitter {
    //this is an arbitrary field added in code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gatewayName: any

    constructor(server, address?, password?)

    addClient(clientId, senderId?)

    addNewScheduleEvent(scheduleType, senderId?)

    cancelDelay(senderId?)

    close()

    connect()

    deleteScheduleEventById(scheduleId, senderId?)

    getChemHistoryData(fromTime, toTime, senderId?)

    getChemicalData(senderId?)

    getControllerConfig(senderId?)

    getEquipmentConfiguration(senderId?)

    getHistoryData(fromTime, toTime, senderId?)

    getPoolStatus()

    getPumpStatus(pumpId, senderId?)

    getSaltCellConfig(senderId?)

    getScheduleData(scheduleType, senderId?)

    getSystemTime(senderId?)

    getVersion(senderId?)

    getWeatherForecast(senderId?)

    login()

    onClientMessage(msg)

    onConnected()

    pingServer(senderId?)

    processData(msg)

    removeClient(clientId, senderId?)

    sendLightCommand(controllerId, command, senderId?)

    setCircuitRuntimebyId(circuitId, runTime, senderId?)

    setCircuitState(controllerId, circuitId, circuitState, senderId?)

    setHeatMode(controllerId, bodyType, heatMode, senderId?)

    setPumpFlow(pumpId, circuitId, setPoint, isRPMs, senderId?)

    setSaltCellOutput(controllerId, poolOutput, spaOutput, senderId?)

    setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId?)

    setSetPoint(controllerId, bodyType, temperature, senderId?)

    setSystemTime(date, shouldAdjustForDST, senderId?)
  }

  declare const HEAT_MODE_DONTCHANGE
  declare const HEAT_MODE_HEATPUMP
  declare const HEAT_MODE_OFF
  declare const HEAT_MODE_SOLAR
  declare const HEAT_MODE_SOLARPREFERRED
  declare const LIGHT_CMD_COLOR_BLUE
  declare const LIGHT_CMD_COLOR_GREEN
  declare const LIGHT_CMD_COLOR_MODE_AMERICAN
  declare const LIGHT_CMD_COLOR_MODE_CARIBBEAN
  declare const LIGHT_CMD_COLOR_MODE_PARTY
  declare const LIGHT_CMD_COLOR_MODE_ROMANCE
  declare const LIGHT_CMD_COLOR_MODE_ROYAL
  declare const LIGHT_CMD_COLOR_MODE_SUNSET
  declare const LIGHT_CMD_COLOR_PURPLE
  declare const LIGHT_CMD_COLOR_RED
  declare const LIGHT_CMD_COLOR_SET
  declare const LIGHT_CMD_COLOR_SET_RECALL
  declare const LIGHT_CMD_COLOR_SET_SAVE
  declare const LIGHT_CMD_COLOR_SWIM
  declare const LIGHT_CMD_COLOR_SYNC
  declare const LIGHT_CMD_COLOR_WHITE
  declare const LIGHT_CMD_LIGHTS_OFF
  declare const LIGHT_CMD_LIGHTS_ON
  declare const PUMP_TYPE_INTELLIFLOVF
  declare const PUMP_TYPE_INTELLIFLOVS
  declare const PUMP_TYPE_INTELLIFLOVSF
}
