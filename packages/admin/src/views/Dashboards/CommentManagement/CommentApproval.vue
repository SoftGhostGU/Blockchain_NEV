<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="评论审核"
      subtitle="管理和审核用户评论"
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
          <n-form-item-gi :span="6" label="车主ID/名" path="driverInfo">
            <n-input
              v-model:value="filterForm.driverInfo"
              placeholder="请输入车主ID或车主名"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="用户ID/名" path="userInfo">
            <n-input
              v-model:value="filterForm.userInfo"
              placeholder="请输入用户ID或用户名"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="订单号" path="orderId">
            <n-input
              v-model:value="filterForm.orderId"
              placeholder="请输入订单号"
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
    <n-card title="待审核评论列表" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
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

    <!-- 审核详情弹窗 -->
    <n-modal v-model:show="showAudit" preset="card" title="评论审核" style="width: 700px">
      <!-- 评论基本信息 -->
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

      <n-divider>AI 审核提示</n-divider>
      <div style="margin-bottom: 16px; color: #888;">
        <n-skeleton v-if="aiLoading" text :repeat="2" />
        <div v-else>{{ aiSuggestion }}</div>
      </div>

      <n-divider>审核操作</n-divider>
      <n-form :model="auditForm" label-placement="left" label-width="120px">
        <n-form-item label="审核结果">
          <n-radio-group v-model:value="auditForm.status">
            <n-radio :value="2">通过</n-radio>
            <n-radio :value="3">不通过</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="理由" v-if="auditForm.status === 3">
          <n-input
            v-model:value="auditForm.reason"
            type="textarea"
            placeholder="请输入不通过的理由"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <n-button ghost @click="showAudit = false">取消</n-button>
          <n-button type="primary" @click="submitAudit" :loading="auditLoading">提交审核</n-button>
        </div>
      </template>
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
  NRadio,
  NRadioGroup,
  NForm,
  NFormItem,
  NInput,
  NSkeleton,
  useMessage,
  NFormItemGi,
  NGrid,
  NSpace,
  NIcon,
  NCard
} from "naive-ui"
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { api } from "@/api"

const message = useMessage()

// 数据状态
const loading = ref(false)
const reviews = ref<any[]>([])
const showAudit = ref(false)
const selectedReview = ref<any>(null)
const auditLoading = ref(false)

// AI 审核提示
const aiLoading = ref(false)
const aiSuggestion = ref("")

// 筛选表单
const filterForm = reactive({
  driverInfo: '',
  userInfo: '',
  orderId: ''
})

// 审核表单
const auditForm = reactive({
  status: 2, // 2=通过, 3=拒绝
  reason: ""
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

// 搜索
const handleSearch = () => {
  paginationReactive.page = 1
  fetchReviews()
}

// 重置
const handleReset = () => {
  filterForm.driverInfo = ''
  filterForm.userInfo = ''
  filterForm.orderId = ''
  paginationReactive.page = 1
  fetchReviews()
}

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
    if (filterForm.driverInfo?.trim()) {
      params.driverInfo = filterForm.driverInfo.trim()
    }
    if (filterForm.userInfo?.trim()) {
      params.userInfo = filterForm.userInfo.trim()
    }
    if (filterForm.orderId?.trim()) {
      params.orderId = filterForm.orderId.trim()
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
    } else if (Array.isArray(response)) {
      // 处理空数据库情况，后端可能直接返回空数组
      reviews.value = response
      paginationReactive.itemCount = response.length
      
      console.log('解析后的数据（空数组）:', { 
        dataList: response.length, 
        totalCount: response.length
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

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 打开审核弹窗
const openAudit = (row: any) => {
  selectedReview.value = row
  showAudit.value = true
  auditForm.status = 2
  auditForm.reason = ""

  // 模拟 AI 审核请求
  aiLoading.value = true
  aiSuggestion.value = ""
  setTimeout(() => {
    aiSuggestion.value = "AI 提示：评论内容积极，无违规。"
    aiLoading.value = false
  }, 1500)
}

// 提交审核
const submitAudit = async () => {
  if (auditForm.status === 3 && !auditForm.reason.trim()) {
    message.error("请填写不通过理由")
    return
  }
  
  try {
    auditLoading.value = true
    
    const data: any = {}
    if (auditForm.reason.trim()) {
      data.remark = auditForm.reason.trim()
    }
    
    // 调用审核API，status=2表示通过，status=3表示拒绝
    await api.reviews.audit(selectedReview.value.reviewId, auditForm.status, data)
    
    message.success(`审核${auditForm.status === 2 ? '通过' : '拒绝'}成功`)
    showAudit.value = false
    fetchReviews() // 刷新列表
  } catch (error) {
    console.error('审核提交失败:', error)
    message.error('审核提交失败，请稍后重试')
  } finally {
    auditLoading.value = false
  }
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
          type: "warning",
          ghost: true,
          onClick: () => openAudit(row)
        },
        { default: () => "审核" }
      )
    }
  }
]

// 组件挂载时获取数据
onMounted(() => {
  fetchReviews()
})
</script>
