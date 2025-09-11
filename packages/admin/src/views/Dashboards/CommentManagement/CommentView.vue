<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header
      title="评论查看"
      subtitle="管理和查看系统中的用户评价"
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

    <!-- 查看详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="评论详情" style="width: 600px">
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
  NDivider
} from "naive-ui"
import Mock from "mockjs"
import type { Review } from "@/types/Review"

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
const showDetail = ref(false)
const selectedReview = ref<Review | null>(null)

// 操作函数
const showDetails = (row: Review) => {
  selectedReview.value = row
  showDetail.value = true
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
