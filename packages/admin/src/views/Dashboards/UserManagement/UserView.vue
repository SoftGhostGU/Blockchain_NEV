<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header title="用户查看" subtitle="查看系统中的普通用户信息" />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="users"
      :pagination="{ pageSize: 10 }"
      style="margin-top: 3vh;"
      bordered
      striped
    />

    <!-- 查看详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="用户详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="用户ID">{{ selectedUser?.user_id }}</n-descriptions-item>
        <n-descriptions-item label="用户名">{{ selectedUser?.username }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ selectedUser?.phone }}</n-descriptions-item>
        <n-descriptions-item label="信用分">{{ selectedUser?.credit_score }}</n-descriptions-item>
        <n-descriptions-item label="账户余额">{{ selectedUser?.balance }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedUser?.created_at }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedUser?.updated_at }}</n-descriptions-item>
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

// 用户类型
import type { UserDTO } from '@/types/User.ts'

// 弹窗状态
const showDetail = ref(false)
const selectedUser = ref<UserDTO | null>(null)

// 模拟数据
const users = ref<UserDTO[]>(
  Mock.mock({
    'list|20': [
      {
        'user_id|+1': 1,
        username: '@first @last',
        phone: /^1[3456789]\d{9}$/,
        password: '@string("lower", 8)',
        credit_score: '@integer(60, 100)',
        balance: '@float(10, 5000, 2, 2)',
        created_at: '@datetime("yyyy-MM-dd HH:mm:ss")',
        updated_at: '@datetime("yyyy-MM-dd HH:mm:ss")'
      }
    ]
  }).list
)

// 表格列
const columns = [
  { title: '用户ID', key: 'user_id' },
  { title: '用户名', key: 'username' },
  { title: '手机号', key: 'phone' },
  { title: '信用分', key: 'credit_score' },
  { title: '账户余额', key: 'balance' },
  { title: '创建时间', key: 'created_at' },
  {
    title: '操作',
    key: 'actions',
    render(row: UserDTO) {
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
const showDetails = (row: UserDTO) => {
  selectedUser.value = row
  showDetail.value = true
}
</script>
