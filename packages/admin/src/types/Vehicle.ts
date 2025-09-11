// 车辆数据类型
export interface Vehicle {
  vehicleId: number
  licensePlate: string
  driverId: number
  fuelLevel: number
  conditionId: number
  createdAt: string
  updatedAt: string
  conditionInfo: string
  batteryPercent: string
  milesToGo: string
  bodyState: string
  tirePressure: string
  brakeState: string
  powerState: string
}
