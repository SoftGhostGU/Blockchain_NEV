<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header title="汽车注册审核" subtitle="管理车辆注册审核流程" />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="vehicles"
      :pagination="pagination"
      style="margin-top: 3vh;"
      bordered
      striped
    />

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="车辆审核" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="车辆ID">{{ selectedVehicle?.vehicleId }}</n-descriptions-item>
        <n-descriptions-item label="车牌号">{{ selectedVehicle?.licensePlate }}</n-descriptions-item>
        <n-descriptions-item label="司机ID">{{ selectedVehicle?.driverId }}</n-descriptions-item>
        <n-descriptions-item label="油量">{{ selectedVehicle?.fuelLevel }}</n-descriptions-item>
        <n-descriptions-item label="状况ID">{{ selectedVehicle?.conditionId }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedVehicle?.createdAt }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedVehicle?.updatedAt }}</n-descriptions-item>
      </n-descriptions>

      <n-divider>AI 审核建议</n-divider>
      <div v-if="loading" style="padding: 8px">
        <n-skeleton :repeat="1" :animation="true" />
      </div>
      <div v-else>
        <n-alert type="info" title="AI 建议" :closable="false">
          {{ selectedVehicle?.aiSuggestion }}
        </n-alert>
      </div>

      <n-divider>审核操作</n-divider>
      <div style="margin-top: 16px">
        <!-- 单选框只绑定当前车辆 -->
        <n-radio-group v-model:value="approvalStatus">
          <n-radio value="通过">通过</n-radio>
          <n-radio value="不通过">不通过</n-radio>
        </n-radio-group>
        <n-input
          v-if="approvalStatus === '不通过'"
          v-model:value="rejectReason"
          type="textarea"
          placeholder="请输入不通过理由"
          style="margin-top: 12px"
        />
      </div>

      <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 8px">
        <n-button @click="showDetail = false">取消</n-button>
        <n-button type="primary" @click="submitApproval">提交审核</n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NDataTable,
  NButton,
  NModal,
  NPageHeader,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NRadio,
  NRadioGroup,
  NInput,
  NAlert,
  NSkeleton,
  useMessage
} from 'naive-ui'
import Mock from 'mockjs'

const message = useMessage()

// 类型定义
type VehicleDTO = {
  vehicleId: number
  licensePlate: string
  driverId: number
  fuelLevel: number
  conditionId: number
  createdAt: string
  updatedAt: string
  aiSuggestion: string
}

// 分页配置
const pagination = {
  pageSize: 10
}

// 弹窗状态
const showDetail = ref(false)
const selectedVehicle = ref<VehicleDTO | null>(null)
const loading = ref(false)

// 审核状态，只针对当前车辆
const approvalStatus = ref<'通过' | '不通过'>('通过')
const rejectReason = ref('')

// 示例数据（Mock.js 生成）
const vehicles = ref<VehicleDTO[]>(
  Mock.mock({
    'list|20': [
      {
        'vehicleId|+1': 1,
        'licensePlate': '@string("upper", 1)@integer(1000,9999)@string("upper",1)',
        'driverId|100-200': 1,
        'fuelLevel|10-100.1': 1,
        'conditionId|1-5': 1,
        'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
        'updatedAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
        'aiSuggestion': '@pick(["建议通过", "建议不通过", "推荐人工审核"])'
      }
    ]
  }).list
)

// 表格列
const columns = [
  { title: '车辆ID', key: 'vehicleId' },
  { title: '车牌号', key: 'licensePlate' },
  { title: '司机ID', key: 'driverId' },
  { title: '油量', key: 'fuelLevel' },
  { title: '状况ID', key: 'conditionId' },
  { title: '创建时间', key: 'createdAt' },
  { title: '更新时间', key: 'updatedAt' },
  {
    title: '操作',
    key: 'actions',
    render(row: VehicleDTO) {
      return h(
        'div',
        { style: { display: 'flex', gap: '8px' } },
        [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              ghost: true,
              onClick: () => openModal(row)
            },
            { default: () => '审核' }
          )
        ]
      )
    }
  }
]

// 打开弹窗
const openModal = (row: VehicleDTO) => {
  selectedVehicle.value = row
  approvalStatus.value = '通过'
  rejectReason.value = ''
  loading.value = true
  showDetail.value = true

  // 模拟 AI 请求延迟，只针对 AI 建议
  setTimeout(() => {
    loading.value = false
  }, 1200)
}

// 提交审核
const submitApproval = () => {
  message.success(
    `车辆 ${selectedVehicle.value?.licensePlate} 审核结果: ${approvalStatus.value}` +
      (approvalStatus.value === '不通过' ? `，理由：${rejectReason.value}` : '')
  )
  showDetail.value = false
}
</script>
