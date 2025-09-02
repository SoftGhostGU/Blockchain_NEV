<template>
  <n-layout has-sider style="height: 100vh">
    <!-- 左侧菜单 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger="bar"
      class="sidebar"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="title">
        <h2 @click="handleMenuSelect('/dashboard')">{{ collapsed ? "A" : "AutoCrowd 管理系统" }}</h2>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :expand-icon="expandIcon"
        v-model="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <!-- 右侧内容 -->
    <n-layout>
      <router-view />
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import {
  CaretDownOutline,
  CarOutline,
  PeopleOutline,
  ChatbubbleEllipsesOutline,
  ReceiptOutline,
  CashOutline,
  EyeOutline,
  CheckmarkDoneOutline,
  PersonOutline,
} from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import { h, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const collapsed = ref(false);
const activeKey = ref<string | null>(null);

const router = useRouter();
const route = useRoute();

// 工具函数：渲染图标
const renderIcon = (icon: any) => () =>
  h(NIcon, null, { default: () => h(icon) });

// 菜单配置
const menuOptions: MenuOption[] = [
  {
    label: "车辆管理",
    key: "/dashboard/car-management",
    icon: renderIcon(CarOutline),
    children: [
      {
        label: "车辆查看",
        key: "/dashboard/car-management/car-view",
        icon: renderIcon(EyeOutline),
      },
      {
        label: "车辆审批",
        key: "/dashboard/car-management/car-approval",
        icon: renderIcon(CheckmarkDoneOutline),
      },
    ],
  },
  {
    label: "用户管理",
    key: "/dashboard/user-management",
    icon: renderIcon(PeopleOutline),
    children: [
      {
        label: "用户查看",
        key: "/dashboard/user-management/user-view",
        icon: renderIcon(EyeOutline),
      },
      {
        label: "车主查看",
        key: "/dashboard/user-management/owner-view",
        icon: renderIcon(PersonOutline),
      },
    ],
  },
  {
    label: "评论管理",
    key: "/dashboard/comment-management",
    icon: renderIcon(ChatbubbleEllipsesOutline),
    children: [
      {
        label: "评论查看",
        key: "/dashboard/comment-management/comment-view",
        icon: renderIcon(EyeOutline),
      },
      {
        label: "评论审批",
        key: "/dashboard/comment-management/comment-approval",
        icon: renderIcon(CheckmarkDoneOutline),
      },
    ],
  },
  {
    label: "订单管理",
    key: "/dashboard/order-management",
    icon: renderIcon(ReceiptOutline),
  },
  {
    label: "财务管理",
    key: "/dashboard/finance-management",
    icon: renderIcon(CashOutline),
  },
];

const expandIcon = () => h(NIcon, null, { default: () => h(CaretDownOutline) });

// 菜单点击跳转
const handleMenuSelect = (key: string) => {
  router.push(key);
};

// 保持菜单高亮和路由一致
watch(
  () => route.path,
  (newPath) => {
    activeKey.value = newPath;
  },
  { immediate: true }
);
</script>


<style scoped>

.title {
  width: fit-content;
  height: 56px;
  margin: 0 auto;
  color: #549e5f;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>