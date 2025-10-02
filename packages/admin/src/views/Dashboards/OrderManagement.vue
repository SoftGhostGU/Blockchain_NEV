<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="订单管理"
      subtitle="查看和管理系统中的订单"
      style="flex-shrink: 0;"
    />

    <!-- 筛选表单 -->
    <n-card title="筛选条件" style="margin-top: 16px;">
      <n-form :model="filterForm" label-placement="left" label-width="80px">
        <n-grid :cols="10" :x-gap="12">
          <n-form-item-gi :span="2" label="订单ID">
            <n-input v-model:value="filterForm.orderId" placeholder="订单ID" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="用户ID">
            <n-input v-model:value="filterForm.userId" placeholder="用户ID" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="司机ID">
            <n-input v-model:value="filterForm.driverId" placeholder="司机ID" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="订单状态">
            <n-select
              v-model:value="filterForm.status"
              placeholder="订单状态"
              clearable
              :options="[
                { label: '待支付', value: 0 },
                { label: '进行中', value: 1 },
                { label: '已完成', value: 2 },
                { label: '已取消', value: 3 }
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
    <n-card title="订单列表" style="margin-top: 16px; flex: 1; display: flex; flex-direction: column; min-height: 0;">
      <n-data-table
        :columns="columns"
        :data="orders"
        :loading="loading"
        :pagination="paginationReactive"
        :bordered="false"
        :single-line="false"
        flex-height
        style="height: 100%;"
        remote
      />
    </n-card>

    <!-- 订单详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="订单详情" style="width: 700px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="订单ID">{{ selectedOrder?.order_id }}</n-descriptions-item>
        <n-descriptions-item label="用户ID">{{ selectedOrder?.user_id }}</n-descriptions-item>
        <n-descriptions-item label="司机ID">{{ selectedOrder?.driver_id }}</n-descriptions-item>
        <n-descriptions-item label="车辆ID">{{ selectedOrder?.vehicle_id }}</n-descriptions-item>
        <n-descriptions-item label="起点">{{ selectedOrder?.start_location }}</n-descriptions-item>
        <n-descriptions-item label="终点">{{ selectedOrder?.destination }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ statusMap[selectedOrder?.status ?? 0] }}</n-descriptions-item>
        <n-descriptions-item label="订单类型">{{ selectedOrder?.type }}</n-descriptions-item>
        <n-descriptions-item label="预估价格">{{ selectedOrder?.estimated_price }}</n-descriptions-item>
        <n-descriptions-item label="实际价格">{{ selectedOrder?.actual_price }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedOrder?.created_at }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedOrder?.updated_at }}</n-descriptions-item>
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
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NIcon,
  NCard,
  useMessage
} from "naive-ui"
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { api } from "@/api"
import type { Order } from "@/types/Order"

const message = useMessage()

// 订单状态映射
const statusMap: Record<number, string> = {
  0: "待支付",
  1: "进行中",
  2: "已完成",
  3: "已取消"
}

// 数据状态
const loading = ref(false)
const orders = ref<any[]>([])
const showDetail = ref(false)
const selectedOrder = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  orderId: "",
  userId: "",
  driverId: "",
  status: null as number | null
})

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    paginationReactive.page = page
    fetchOrders()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    fetchOrders()
  },
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`,
  itemCount: 0
})

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    
    // 构建查询参数（后端使用0基础的页码）
    const params: any = {
      page: paginationReactive.page - 1, // 前端页码从1开始，后端从0开始
      size: paginationReactive.pageSize
    }
    
    // 添加筛选条件
    if (filterForm.orderId.trim()) params.orderId = filterForm.orderId.trim()
    if (filterForm.userId.trim()) params.userId = filterForm.userId.trim()
    if (filterForm.driverId.trim()) params.driverId = filterForm.driverId.trim()
    if (filterForm.status !== null) params.status = filterForm.status
    
    console.log('发送API请求:', { url: '/api/admin/orders', params })
    
    const response = await api.orders.getList(params)
    
    console.log('API响应数据:', response)
    
    // 处理标准分页响应格式
    if (response && response.content && Array.isArray(response.content)) {
      orders.value = response.content
      paginationReactive.itemCount = response.totalElements || 0
    } else if (Array.isArray(response)) {
      // 处理直接返回数组的情况（数据库为空）
      orders.value = response
      paginationReactive.itemCount = response.length
    } else {
      console.warn('API响应格式不符合预期:', response)
      orders.value = []
      paginationReactive.itemCount = 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    message.error('获取订单列表失败，请稍后重试')
    orders.value = []
    paginationReactive.itemCount = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  paginationReactive.page = 1
  fetchOrders()
}

// 重置筛选
const handleReset = () => {
  filterForm.orderId = ""
  filterForm.userId = ""
  filterForm.driverId = ""
  filterForm.status = null
  paginationReactive.page = 1
  fetchOrders()
}

// 查看详情
const showDetails = (row: any) => {
  selectedOrder.value = row
  showDetail.value = true
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 表格列
const columns = [
  { title: "订单ID", key: "order_id" },
  { title: "用户ID", key: "user_id" },
  { title: "司机ID", key: "driver_id" },
  { title: "车辆ID", key: "vehicle_id" },
  { title: "起点", key: "start_location" },
  { title: "终点", key: "destination" },
  {
    title: "状态",
    key: "status",
    render(row: Order) {
      return statusMap[row.status]
    }
  },
  { title: "预估价格", key: "estimated_price" },
  { title: "实际价格", key: "actual_price" },
  { title: "创建时间", key: "created_at" },
  {
    title: "操作",
    key: "actions",
    render(row: Order) {
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
