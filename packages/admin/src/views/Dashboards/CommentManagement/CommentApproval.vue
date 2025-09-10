<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header
      title="评论审核"
      subtitle="管理和审核用户评论"
    />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="reviews"
      :pagination="pagination"
      style="margin-top: 3vh;"
      bordered
      striped
    />

    <!-- 审核详情弹窗 -->
    <n-modal v-model:show="showAudit" preset="card" title="评论审核" style="width: 700px">
      <!-- 评论基本信息 -->
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="评论ID">{{ selectedReview?.review_id }}</n-descriptions-item>
        <n-descriptions-item label="订单号">{{ selectedReview?.order_id }}</n-descriptions-item>
        <n-descriptions-item label="用户ID">{{ selectedReview?.user_id }}</n-descriptions-item>
        <n-descriptions-item label="司机ID">{{ selectedReview?.driver_id }}</n-descriptions-item>
        <n-descriptions-item label="评分">{{ selectedReview?.comment_star }}</n-descriptions-item>
        <n-descriptions-item label="评论时间">{{ selectedReview?.created_at }}</n-descriptions-item>
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
          <n-radio-group v-model:value="auditForm.approval">
            <n-radio value="approved">通过</n-radio>
            <n-radio value="rejected">不通过</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="理由" v-if="auditForm.approval === 'rejected'">
          <n-input
            v-model:value="auditForm.reason"
            type="textarea"
            placeholder="请输入不通过的理由"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <n-button ghost @click="showAudit = false">取消</n-button>
          <n-button type="primary" @click="submitAudit">提交审核</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from "vue"
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
  useMessage
} from "naive-ui"
import Mock from "mockjs"
import type { Review } from "@/types/Review"

const message = useMessage()

// 分页配置
const pagination = {
  pageSize: 10
}

// 使用 MockJS 生成随机评论数据
const reviews = ref<Review[]>(
  Mock.mock({
    "list|20": [
      {
        "review_id|+1": 1,
        "order_id": () => "ORD-" + Mock.Random.integer(1000, 9999),
        "user_id|1-20": 1,
        "driver_id|1-10": 1,
        content: () =>
          Mock.Random.pick([
            "司机很准时，服务态度很好！",
            "车辆干净整洁，值得推荐。",
            "迟到了一会儿，希望改进。",
            "开车很稳，体验不错。",
            "态度一般般。",
            "非常专业，五星好评！"
          ]),
        created_at: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
        updated_at: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
        comment_star: () => Mock.Random.float(1, 5, 1, 1)
      }
    ]
  }).list
)

// 弹窗状态
const showAudit = ref(false)
const selectedReview = ref<Review | null>(null)

// AI 审核提示
const aiLoading = ref(false)
const aiSuggestion = ref("")

// 审核表单
const auditForm = ref({
  approval: "approved",
  reason: ""
})

// 打开审核弹窗
const openAudit = (row: Review) => {
  selectedReview.value = row
  showAudit.value = true
  auditForm.value = { approval: "approved", reason: "" }

  // 模拟 AI 审核请求
  aiLoading.value = true
  aiSuggestion.value = ""
  setTimeout(() => {
    aiSuggestion.value = Mock.Random.pick([
      "AI 提示：评论内容积极，无违规。",
      "AI 提示：评论内容中立，正常。",
      "AI 提示：评论可能存在恶意言辞，请人工复核。"
    ])
    aiLoading.value = false
  }, 1500)
}

// 提交审核
const submitAudit = () => {
  if (auditForm.value.approval === "rejected" && !auditForm.value.reason) {
    message.error("请填写不通过理由")
    return
  }
  message.success(
    `审核完成：${auditForm.value.approval === "approved" ? "通过" : "不通过"}`
  )
  showAudit.value = false
}

// 表格列
const columns = [
  { title: "ID", key: "review_id" },
  { title: "订单号", key: "order_id" },
  { title: "用户ID", key: "user_id" },
  { title: "司机ID", key: "driver_id" },
  { title: "评分", key: "comment_star" },
  { title: "评论时间", key: "created_at" },
  {
    title: "操作",
    key: "actions",
    render(row: Review) {
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
</script>
