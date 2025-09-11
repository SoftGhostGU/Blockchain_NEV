<template>
  <div style="padding: 16px">
    <!-- 页面头部 -->
    <n-page-header
      title="订单管理"
      subtitle="查看和管理系统中的订单"
    />

    <!-- 表格 -->
    <n-data-table
      :columns="columns"
      :data="orders"
      :pagination="pagination"
      style="margin-top: 3vh;"
      bordered
      striped
    />

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
import { ref, h } from "vue"
import {
  NDataTable,
  NButton,
  NModal,
  NPageHeader,
  NDescriptions,
  NDescriptionsItem
} from "naive-ui"
import Mock from "mockjs"
import type { Order } from "@/types/Order"

// 订单状态映射
const statusMap: Record<number, string> = {
  0: "待支付",
  1: "进行中",
  2: "已完成",
  3: "已取消"
}

// 分页配置
const pagination = {
  pageSize: 10
}

// 使用 MockJS 生成订单数据
const orders = ref<Order[]>(
  Mock.mock({
    "list|20": [
      {
        order_id: () => "ORD-" + Mock.Random.integer(1000, 9999),
        "user_id|1-20": 1,
        "driver_id|1-10": 1,
        "vehicle_id|1-10": 1,
        start_location: () => Mock.Random.city(true),
        destination: () => Mock.Random.city(true),
        "status|0-3": 0,
        estimated_price: () => Mock.Random.float(20, 200, 2, 2),
        actual_price: () => Mock.Random.float(20, 200, 2, 2),
        type: () => Mock.Random.pick(["快车", "专车", "拼车", "代驾"]),
        created_at: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
        updated_at: () => Mock.Random.datetime("yyyy-MM-dd HH:mm:ss")
      }
    ]
  }).list
)

// 弹窗状态
const showDetail = ref(false)
const selectedOrder = ref<Order | null>(null)

// 查看详情
const showDetails = (row: Order) => {
  selectedOrder.value = row
  showDetail.value = true
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
