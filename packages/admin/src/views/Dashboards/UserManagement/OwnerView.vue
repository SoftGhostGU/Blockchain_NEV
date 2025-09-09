<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header title="车主查看" subtitle="查看系统中的车主信息" />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="drivers"
      :pagination="{ pageSize: 10 }"
      style="margin-top: 3vh;"
      bordered
      striped
    />

    <!-- 查看详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="车主详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="车主ID">{{ selectedDriver?.driver_id }}</n-descriptions-item>
        <n-descriptions-item label="用户名">{{ selectedDriver?.username }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ selectedDriver?.phone }}</n-descriptions-item>
        <n-descriptions-item label="信用分">{{ selectedDriver?.credit_score }}</n-descriptions-item>
        <n-descriptions-item label="钱包余额">{{ selectedDriver?.wallet_balance }}</n-descriptions-item>
        <n-descriptions-item label="银行卡">{{ selectedDriver?.bank_card }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedDriver?.created_at }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedDriver?.updated_at }}</n-descriptions-item>
      </n-descriptions>
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
  NDescriptionsItem
} from 'naive-ui'
import Mock from 'mockjs'

// 车主类型
import type { DriverDTO } from '@/types/Driver.ts'

// 弹窗状态
const showDetail = ref(false)
const selectedDriver = ref<DriverDTO | null>(null)

// 模拟数据
const drivers = ref<DriverDTO[]>(
  Mock.mock({
    'list|15': [
      {
        'driver_id|+1': 1,
        username: '@first @last',
        phone: /^1[3456789]\d{9}$/,
        password: '@string("lower", 8)',
        credit_score: '@integer(60, 100)',
        wallet_balance: '@float(100, 10000, 2, 2)',
        bank_card: /^6222\d{12}$/,
        created_at: '@datetime("yyyy-MM-dd HH:mm:ss")',
        updated_at: '@datetime("yyyy-MM-dd HH:mm:ss")'
      }
    ]
  }).list
)

// 表格列
const columns = [
  { title: '车主ID', key: 'driver_id' },
  { title: '用户名', key: 'username' },
  { title: '手机号', key: 'phone' },
  { title: '信用分', key: 'credit_score' },
  { title: '钱包余额', key: 'wallet_balance' },
  { title: '银行卡', key: 'bank_card' },
  { title: '创建时间', key: 'created_at' },
  {
    title: '操作',
    key: 'actions',
    render(row: DriverDTO) {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          ghost: true,
          onClick: () => showDetails(row)
        },
        { default: () => '查看详情' }
      )
    }
  }
]

// 打开详情
const showDetails = (row: DriverDTO) => {
  selectedDriver.value = row
  showDetail.value = true
}
</script>
