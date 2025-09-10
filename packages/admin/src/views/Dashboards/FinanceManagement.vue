<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header
      title="财务管理"
      subtitle="查看系统中的财务流水"
    />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="financials"
      :pagination="pagination"
      style="margin-top: 3vh;"
      bordered
      striped
    />

    <!-- 财务详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="财务详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="流水ID">{{ selectedFinancial?.financial_id }}</n-descriptions-item>
        <n-descriptions-item label="用户ID">{{ selectedFinancial?.user_id }}</n-descriptions-item>
        <n-descriptions-item label="角色">{{ selectedFinancial?.role }}</n-descriptions-item>
        <n-descriptions-item label="交易类型">{{ selectedFinancial?.transaction_type }}</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ selectedFinancial?.amount }}</n-descriptions-item>
        <n-descriptions-item label="交易时间">{{ selectedFinancial?.transaction_time }}</n-descriptions-item>
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
  NTag
} from "naive-ui"
import Mock from "mockjs"
import type { Financial } from "@/types/Financial"

// 分页配置
const pagination = {
  pageSize: 10
}

// 使用 MockJS 生成财务流水数据
const financials = ref<Financial[]>(
  Mock.mock({
    "list|20": [
      {
        "financial_id|+1": 1,
        "user_id|1-20": 1,
        role: () => Mock.Random.pick(["用户", "司机"]),
        transaction_type: () =>
          Mock.Random.pick(["Expenses", "Withdrawal", "Earnings", "Recharge"]),
        amount: () => Mock.Random.float(10, 1000, 2, 2),
        transaction_time: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss")
      }
    ]
  }).list
)

// 弹窗状态
const showDetail = ref(false)
const selectedFinancial = ref<Financial | null>(null)

// 查看详情
const showDetails = (row: Financial) => {
  selectedFinancial.value = row
  showDetail.value = true
}

// 渲染交易类型标签
const renderTransactionTag = (type: string) => {
  let color = "default"
  switch (type) {
    case "Expenses":
      color = "error"
      break
    case "Withdrawal":
      color = "warning"
      break
    case "Earnings":
      color = "success"
      break
    case "Recharge":
      color = "info"
      break
  }
  return h(NTag, { type: color, bordered: false }, { default: () => type })
}

// 表格列
const columns = [
  { title: "流水ID", key: "financial_id" },
  { title: "用户ID", key: "user_id" },
  { title: "角色", key: "role" },
  {
    title: "交易类型",
    key: "transaction_type",
    render(row: Financial) {
      return renderTransactionTag(row.transaction_type)
    }
  },
  {
    title: "金额",
    key: "amount",
    render(row: Financial) {
      return "¥" + row.amount
    }
  },
  { title: "交易时间", key: "transaction_time" },
  {
    title: "操作",
    key: "actions",
    render(row: Financial) {
      return h(
        NButton,
        {
          size: "small",
          type: "primary",
          ghost: true,
          onClick: () => showDetails(row)
        },
        { default: () => "查看详情" }
      )
    }
  }
]
</script>
