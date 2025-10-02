<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="用户查看"
      subtitle="查看系统中的普通用户信息"
      style="flex-shrink: 0;"
    />

    <!-- 筛选表单 -->
    <n-card title="用户筛选" style="margin: 16px 0; flex-shrink: 0;">
      <n-form
        :model="filterForm"
        label-placement="left"
        label-width="auto"
        :show-feedback="false"
      >
        <n-grid :cols="24" :x-gap="12">
          <n-form-item-gi :span="6" label="用户名" path="username">
            <n-input
              v-model:value="filterForm.username"
              placeholder="请输入用户名"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12">
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
    <n-card title="用户列表" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
      <n-data-table
        :columns="columns"
        :data="users"
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
    <n-modal v-model:show="showDetail" preset="card" title="用户详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="用户ID">{{ selectedUser?.userId }}</n-descriptions-item>
        <n-descriptions-item label="用户名">{{ selectedUser?.username }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ selectedUser?.phone }}</n-descriptions-item>
        <n-descriptions-item label="信用分">{{ selectedUser?.creditScore }}</n-descriptions-item>
        <n-descriptions-item label="账户余额">{{ selectedUser?.balance }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedUser?.createdAt }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedUser?.updatedAt }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, reactive, onMounted } from 'vue'
import {
  NDataTable,
  NButton,
  NModal,
  NPageHeader,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  NSelect,
  NInput,
  NForm,
  NFormItem,
  NGrid,
  NFormItemGi,
  NSpace,
  NIcon,
  NCard
} from 'naive-ui'
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { api } from "@/api"

// 消息提示
const message = useMessage()

// 数据状态
const loading = ref(false)
const users = ref<any[]>([])
const showDetail = ref(false)
const selectedUser = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  username: ''
})

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
  onChange: (page: number) => {
    paginationReactive.page = page
    fetchUsers()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    fetchUsers()
  },
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
})

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true;
    
    // 构建查询参数（后端使用0基础的页码）
    const params: any = {
      page: paginationReactive.page - 1, // 前端页码从1开始，后端从0开始
      size: paginationReactive.pageSize
    };
    
    // 只添加非空的筛选条件
    if (filterForm.username?.trim()) {
      params.username = filterForm.username.trim();
    }
    
    console.log('发送用户API请求:', { url: '/api/admin/users', params });
    
    const response = await api.users.getList(params);
    
    console.log('用户API响应数据:', response);
    
    // 处理标准分页响应格式
    if (response && response.content && Array.isArray(response.content)) {
      users.value = response.content;
      paginationReactive.itemCount = response.totalElements || 0;
      paginationReactive.pageCount = response.totalPages || Math.ceil(response.totalElements / paginationReactive.pageSize);
      
      console.log('解析后的用户数据:', { 
        dataList: response.content.length, 
        totalCount: response.totalElements,
        totalPages: response.totalPages,
        calculatedPages: Math.ceil(response.totalElements / paginationReactive.pageSize),
        currentPage: response.page,
        pageSize: response.size,
        firstItem: response.content[0] 
      });
    } else {
      console.warn('用户API响应格式不符合预期:', response);
      users.value = [];
      paginationReactive.itemCount = 0;
      paginationReactive.pageCount = 0;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    message.error('获取用户列表失败，请稍后重试');
    users.value = [];
    paginationReactive.itemCount = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  paginationReactive.page = 1;
  fetchUsers();
};

// 重置
const handleReset = () => {
  filterForm.username = '';
  paginationReactive.page = 1;
  fetchUsers();
};

// 打开详情
const showDetails = (row: any) => {
  selectedUser.value = row;
  showDetail.value = true;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 表格列
const columns = [
  { title: '用户ID', key: 'userId', width: 80 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '手机号', key: 'phone', width: 120 },
  { title: '信用分', key: 'creditScore', width: 100 },
  { title: '账户余额', key: 'balance', width: 120, render: (row) => `¥${row.balance}` },
  { title: '创建时间', key: 'createdAt', width: 160, render: (row) => formatDate(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: any) {
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
];

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
:deep(.n-data-table) {
  flex: 1;
  min-height: 0;
}

:deep(.n-data-table-base-table-body) {
  height: calc(100% - 48px) !important;
}

:deep(.n-data-table-base-table-main) {
  height: 100%;
}
</style>