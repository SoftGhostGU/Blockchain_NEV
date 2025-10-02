<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="评论查看"
      subtitle="管理和查看系统中的用户评价"
      style="flex-shrink: 0;"
    />

    <!-- 筛选表单 -->
    <n-card title="评论筛选" style="margin: 16px 0; flex-shrink: 0;">
      <n-form
        :model="filterForm"
        label-placement="left"
        label-width="auto"
        :show-feedback="false"
      >
        <n-grid :cols="24" :x-gap="12">
          <n-form-item-gi :span="6" label="订单号" path="orderId">
            <n-input
              v-model:value="filterForm.orderId"
              placeholder="请输入订单号"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="用户ID" path="userId">
            <n-input
              v-model:value="filterForm.userId"
              placeholder="请输入用户ID"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="司机ID" path="driverId">
            <n-input
              v-model:value="filterForm.driverId"
              placeholder="请输入司机ID"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6">
            <n-space>
              <n-button type="primary" @click="handleSearch">
                <template #icon>
                  <n-icon><SearchOutline /></n-icon>
                </template>
                查询
              </n-button>
              <n-button @click="handleReset">
                <template #icon>
                  <n-icon><RefreshOutline /></n-icon>
                </template>
                重置
              </n-button>
            </n-space>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <!-- 表格 -->
    <n-card title="评论列表" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
      <n-data-table
        :columns="columns"
        :data="reviews"
        :loading="loading"
        :pagination="paginationReactive"
        :bordered="false"
        :single-line="false"
        flex-height
        style="height: 100%;"
        remote
      />
    </n-card>

    <!-- 查看详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="评论详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="评论ID">{{ selectedReview?.reviewId }}</n-descriptions-item>
        <n-descriptions-item label="订单号">{{ selectedReview?.orderId }}</n-descriptions-item>
        <n-descriptions-item label="用户ID">{{ selectedReview?.userId }}</n-descriptions-item>
        <n-descriptions-item label="司机ID">{{ selectedReview?.driverId }}</n-descriptions-item>
        <n-descriptions-item label="评分">{{ selectedReview?.commentStar }}</n-descriptions-item>
        <n-descriptions-item label="评论时间">{{ formatDate(selectedReview?.createdAt) }}</n-descriptions-item>
      </n-descriptions>

      <n-divider>评论内容</n-divider>
      <n-descriptions bordered label-placement="left" :column="1">
        <n-descriptions-item label="内容">{{ selectedReview?.content }}</n-descriptions-item>
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
  NGrid,
  NFormItemGi,
  NSpace,
  NIcon,
  NInput,
  NCard,
  useMessage
} from "naive-ui"
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { api } from "@/api"

// 消息提示
const message = useMessage()

// 数据状态
const loading = ref(false)
const reviews = ref<any[]>([])
const showDetail = ref(false)
const selectedReview = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  orderId: '',
  userId: '',
  driverId: ''
})

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    paginationReactive.page = page
    fetchReviews()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    fetchReviews()
  },
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
})

// 获取评论列表
const fetchReviews = async () => {
  try {
    loading.value = true
    
    // 构建查询参数（后端使用0基础的页码）
    const params: any = {
      page: paginationReactive.page - 1, // 前端页码从1开始，后端从0开始
      size: paginationReactive.pageSize
    }
    
    // 只添加非空的筛选条件
    if (filterForm.orderId?.trim()) {
      params.orderId = filterForm.orderId.trim()
    }
    if (filterForm.userId?.trim()) {
      params.userId = filterForm.userId.trim()
    }
    if (filterForm.driverId?.trim()) {
      params.driverId = filterForm.driverId.trim()
    }
    
    console.log('发送API请求:', { url: '/api/admin/reviews/pending', params })
    
    const response = await api.reviews.getPending(params)
    
    console.log('API响应数据:', response)
    
    // 处理标准分页响应格式
    if (response && response.content && Array.isArray(response.content)) {
      reviews.value = response.content
      paginationReactive.itemCount = response.totalElements || 0
      
      console.log('解析后的数据:', { 
        dataList: response.content.length, 
        totalCount: response.totalElements,
        currentPage: response.page,
        pageSize: response.size,
        firstItem: response.content[0] 
      })
    } else {
      console.warn('API响应格式不符合预期:', response)
      reviews.value = []
      paginationReactive.itemCount = 0
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    message.error('获取评论列表失败，请稍后重试')
    reviews.value = []
    paginationReactive.itemCount = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  paginationReactive.page = 1
  fetchReviews()
}

// 重置
const handleReset = () => {
  filterForm.orderId = ''
  filterForm.userId = ''
  filterForm.driverId = ''
  paginationReactive.page = 1
  fetchReviews()
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 表格列
const columns = [
  { title: "ID", key: "reviewId", width: 80 },
  { title: "订单号", key: "orderId", width: 120 },
  { title: "用户ID", key: "userId", width: 80 },
  { title: "司机ID", key: "driverId", width: 80 },
  { title: "评分", key: "commentStar", width: 80 },
  { title: "评论时间", key: "createdAt", width: 160, render: (row) => formatDate(row.createdAt) },
  {
    title: "操作",
    key: "actions",
    width: 120,
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

// 打开详情
const showDetails = (row: any) => {
  selectedReview.value = row
  showDetail.value = true
}

// 组件挂载时获取数据
onMounted(() => {
  fetchReviews()
})
</script>
