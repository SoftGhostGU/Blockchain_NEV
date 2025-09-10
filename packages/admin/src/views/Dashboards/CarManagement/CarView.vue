<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header
      title="车辆查看"
      subtitle="管理和查看系统中的车辆信息"
    />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="vehicles"
      :pagination="pagination"
      style="margin-top: 3vh;"
      bordered
      striped
    />

    <!-- 查看详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="车辆详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="车辆ID">{{ selectedVehicle?.vehicleId }}</n-descriptions-item>
        <n-descriptions-item label="车牌号">{{ selectedVehicle?.licensePlate }}</n-descriptions-item>
        <n-descriptions-item label="司机ID">{{ selectedVehicle?.driverId }}</n-descriptions-item>
        <n-descriptions-item label="油量">{{ selectedVehicle?.fuelLevel }}</n-descriptions-item>
        <n-descriptions-item label="状况ID">{{ selectedVehicle?.conditionId }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedVehicle?.createdAt }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedVehicle?.updatedAt }}</n-descriptions-item>
      </n-descriptions>

      <n-divider>车辆状况信息</n-divider>
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="状况">{{ selectedVehicle?.conditionInfo }}</n-descriptions-item>
        <n-descriptions-item label="电池百分比">{{ selectedVehicle?.batteryPercent }}</n-descriptions-item>
        <n-descriptions-item label="续航里程">{{ selectedVehicle?.milesToGo }}</n-descriptions-item>
        <n-descriptions-item label="车身状态">{{ selectedVehicle?.bodyState }}</n-descriptions-item>
        <n-descriptions-item label="轮胎压力">{{ selectedVehicle?.tirePressure }}</n-descriptions-item>
        <n-descriptions-item label="刹车状态">{{ selectedVehicle?.brakeState }}</n-descriptions-item>
        <n-descriptions-item label="动力状态">{{ selectedVehicle?.powerState }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue"
import {
  NDataTable,
  NButton,
  NModal,
  NPageHeader,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  useMessage
} from "naive-ui"
import Mock from "mockjs"
import type { Vehicle } from "@/types/Vehicle"

// 分页配置
const pagination = {
  pageSize: 10
}

// 使用 MockJS 生成随机数据
const vehicles = ref<Vehicle[]>(
  Mock.mock({
    "list|20": [
      {
        "vehicleId|+1": 1,
        licensePlate: () => "粤" + Mock.Random.character("upper") + Mock.Random.string("number", 5),
        "driverId|100-200": 1,
        fuelLevel: () => Mock.Random.float(10, 100, 1, 1),
        "conditionId|1-3": 1,
        createdAt: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
        updatedAt: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
        conditionInfo: () => Mock.Random.pick(["正常", "需要维护", "故障"]),
        batteryPercent: () => Mock.Random.integer(50, 100) + "%",
        milesToGo: () => Mock.Random.integer(100, 500) + "km",
        bodyState: () => Mock.Random.pick(["良好", "轻微划痕", "严重损坏"]),
        tirePressure: () => Mock.Random.float(2.0, 3.0, 1, 1) + "bar",
        brakeState: () => Mock.Random.pick(["正常", "偏软", "失效"]),
        powerState: () => Mock.Random.pick(["正常", "异常"])
      }
    ]
  }).list
)

// 弹窗状态
const showDetail = ref(false)
const selectedVehicle = ref<Vehicle | null>(null)

// 操作函数
const showDetails = (row: Vehicle) => {
  selectedVehicle.value = row
  showDetail.value = true
}

// const editRow = (row: Vehicle) => {
//   message.info(`编辑车辆 ${row.licensePlate}`)
// }

// 表格列
const columns = [
  { title: "ID", key: "vehicleId" },
  { title: "车牌号", key: "licensePlate" },
  { title: "司机ID", key: "driverId" },
  { title: "油量", key: "fuelLevel" },
  { title: "状况ID", key: "conditionId" },
  { title: "创建时间", key: "createdAt" },
  { title: "更新时间", key: "updatedAt" },
  {
    title: "操作",
    key: "actions",
    render(row: Vehicle) {
      return h(
        "div",
        { style: { display: "flex", gap: "8px" } },
        [
          h(
            NButton,
            {
              size: "small",
              type: "primary",
              ghost: true,
              onClick: () => showDetails(row)
            },
            { default: () => "查看详情" }
          ),
          // h(
          //   NButton,
          //   {
          //     size: "small",
          //     type: "warning",
          //     ghost: true,
          //     onClick: () => editRow(row)
          //   },
          //   { default: () => "编辑" }
          // )
        ]
      )
    }
  }
]
</script>
