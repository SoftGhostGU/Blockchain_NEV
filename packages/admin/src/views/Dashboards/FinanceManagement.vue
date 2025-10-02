<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="财务管理"
      subtitle="查看系统中的财务流水"
      style="flex-shrink: 0;"
    />

    <!-- 筛选表单 -->
    <n-card title="筛选条件" style="margin-top: 16px; flex-shrink: 0;">
      <n-form :model="filterForm" label-placement="left" label-width="80px">
        <n-grid :cols="10" :x-gap="12">
          <n-form-item-gi :span="2" label="用户ID">
            <n-input v-model:value="filterForm.userId" placeholder="用户ID" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="角色">
            <n-select
              v-model:value="filterForm.role"
              placeholder="角色"
              clearable
              :options="[
                { label: '用户', value: 'user' },
                { label: '司机', value: 'driver' }
              ]"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="交易类型">
            <n-select
              v-model:value="filterForm.transactionType"
              placeholder="交易类型"
              clearable
              :options="[
                { label: '支出', value: 'Expenses' },
                { label: '提现', value: 'Withdrawal' },
                { label: '收入', value: 'Earnings' },
                { label: '充值', value: 'Recharge' }
              ]"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label=" ">
            <div style="display: flex; gap: 8px; align-items: center; height: 100%;">
              <n-button ghost @click="handleReset" size="small">
                <template #icon>
                  <n-icon><RefreshOutline /></n-icon>
                </template>
                重置
              </n-button>
              <n-button type="primary" @click="handleSearch" size="small">
                <template #icon>
                  <n-icon><SearchOutline /></n-icon>
                </template>
                查询
              </n-button>
            </div>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <!-- 表格 -->
    <n-card title="财务流水列表" style="margin-top: 16px; flex: 1; display: flex; flex-direction: column; min-height: 0;">
      <n-data-table
        :columns="columns"
        :data="financials"
        :loading="loading"
        :pagination="paginationReactive"
        :bordered="false"
        :single-line="false"
        flex-height
        style="height: 100%;"
        remote
      />
    </n-card>

    <!-- 财务详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="财务详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="流水ID">{{ selectedFinancial?.financialId }}</n-descriptions-item>
        <n-descriptions-item label="用户ID">{{ selectedFinancial?.userId }}</n-descriptions-item>
        <n-descriptions-item label="角色">{{ selectedFinancial?.role }}</n-descriptions-item>
        <n-descriptions-item label="交易类型">{{ selectedFinancial?.transactionType }}</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ selectedFinancial?.amount }}</n-descriptions-item>
        <n-descriptions-item label="交易时间">{{ formatDate(selectedFinancial?.transactionTime) }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, reactive, onMounted } from "vue"
import {
  NDataTable,
  NButton,
  NModal,
  NPageHeader,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NIcon,
  NCard,
  useMessage
} from "naive-ui"
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { api } from "@/api"
import type { Financial } from "@/types/Financial"

const message = useMessage()

// 数据状态
const loading = ref(false)
const financials = ref<any[]>([])
const showDetail = ref(false)
const selectedFinancial = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  userId: "",
  role: null as string | null,
  transactionType: null as string | null
})

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    paginationReactive.page = page
    fetchFinancials()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    fetchFinancials()
  },
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`,
  itemCount: 0
})

// 获取财务流水列表
const fetchFinancials = async () => {
  try {
    loading.value = true
    
    // 构建查询参数（后端使用0基础的页码）
    const params: any = {
      page: paginationReactive.page - 1, // 前端页码从1开始，后端从0开始
      size: paginationReactive.pageSize
    }
    
    // 添加筛选条件
    if (filterForm.userId.trim()) params.userId = filterForm.userId.trim()
    if (filterForm.role) params.role = filterForm.role
    if (filterForm.transactionType) params.transactionType = filterForm.transactionType
    
    console.log('发送API请求:', { url: '/api/admin/financials', params })
    
    const response = await api.financials.getList(params)
    
    console.log('API响应数据:', response)
    
    // 处理标准分页响应格式
    if (response && response.content && Array.isArray(response.content)) {
      financials.value = response.content
      paginationReactive.itemCount = response.totalElements || 0
    } else if (Array.isArray(response)) {
      // 处理直接返回数组的情况（数据库为空）
      financials.value = response
      paginationReactive.itemCount = response.length
    } else {
      console.warn('API响应格式不符合预期:', response)
      financials.value = []
      paginationReactive.itemCount = 0
    }
  } catch (error) {
    console.error('获取财务流水列表失败:', error)
    message.error('获取财务流水列表失败，请稍后重试')
    financials.value = []
    paginationReactive.itemCount = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  paginationReactive.page = 1
  fetchFinancials()
}

// 重置筛选
const handleReset = () => {
  filterForm.userId = ""
  filterForm.role = null
  filterForm.transactionType = null
  paginationReactive.page = 1
  fetchFinancials()
}

// 查看详情
const showDetails = (row: any) => {
  selectedFinancial.value = row
  showDetail.value = true
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
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
  { title: "流水ID", key: "financialId" },
  { title: "用户ID", key: "userId" },
  { title: "角色", key: "role" },
  {
    title: "交易类型",
    key: "transactionType",
    render(row: any) {
      return renderTransactionTag(row.transactionType)
    }
  },
  {
    title: "金额",
    key: "amount",
    render(row: any) {
      return "¥" + row.amount
    }
  },
  { title: "交易时间", key: "transactionTime", render: (row: any) => formatDate(row.transactionTime) },
  {
    title: "操作",
    key: "actions",
    render(row: any) {
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

// 组件挂载时获取数据
onMounted(() => {
  fetchFinancials()
})
</script>
