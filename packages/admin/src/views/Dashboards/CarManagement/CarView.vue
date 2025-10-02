<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="车辆查看"
      subtitle="管理和查看系统中的车辆信息"
      style="flex-shrink: 0;"
    />

    <!-- 筛选表单 -->
    <n-card title="车辆筛选" style="margin: 16px 0; flex-shrink: 0;">
      <n-form
        :model="filterForm"
        label-placement="left"
        label-width="auto"
        :show-feedback="false"
      >
        <n-grid :cols="24" :x-gap="12">
          <n-form-item-gi :span="6" label="车牌号" path="licensePlate">
            <n-input
              v-model:value="filterForm.licensePlate"
              placeholder="请输入车牌号"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="审核状态" path="auditStatus">
            <n-select
              v-model:value="filterForm.auditStatus"
              placeholder="请选择审核状态"
              clearable
              :options="auditStatusOptions"
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
    <n-card title="车辆列表" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
      <n-data-table
        :columns="columns"
        :data="vehicles"
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
    <n-modal v-model:show="showDetail" preset="card" title="车辆详情" style="width: 600px">
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="车辆ID">{{ selectedVehicle?.vehicleId }}</n-descriptions-item>
        <n-descriptions-item label="车牌号">{{ selectedVehicle?.licensePlate }}</n-descriptions-item>
        <n-descriptions-item label="司机ID">{{ selectedVehicle?.driverId }}</n-descriptions-item>
        <n-descriptions-item label="油量">{{ selectedVehicle?.fuelLevel }}</n-descriptions-item>
        <n-descriptions-item label="状况ID">{{ selectedVehicle?.conditionId }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ selectedVehicle?.createdAt }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ selectedVehicle?.updatedAt }}</n-descriptions-item>
      </n-descriptions>

      <n-divider>车辆状况信息</n-divider>
      <n-descriptions bordered label-placement="left" :column="2">
        <n-descriptions-item label="状况">{{ selectedVehicle?.conditionInfo }}</n-descriptions-item>
        <n-descriptions-item label="电池百分比">{{ selectedVehicle?.batteryPercent }}</n-descriptions-item>
        <n-descriptions-item label="续航里程">{{ selectedVehicle?.milesToGo }}</n-descriptions-item>
        <n-descriptions-item label="车身状态">{{ selectedVehicle?.bodyState }}</n-descriptions-item>
        <n-descriptions-item label="轮胎压力">{{ selectedVehicle?.tirePressure }}</n-descriptions-item>
        <n-descriptions-item label="刹车状态">{{ selectedVehicle?.brakeState }}</n-descriptions-item>
        <n-descriptions-item label="动力状态">{{ selectedVehicle?.powerState }}</n-descriptions-item>
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
} from "naive-ui"
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { api } from "@/api"

// 消息提示
const message = useMessage()

// 数据状态
const loading = ref(false)
const vehicles = ref<any[]>([])
const showDetail = ref(false)
const selectedVehicle = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  licensePlate: '',
  auditStatus: ''
})

// 审核状态选项
const auditStatusOptions = [
  { label: '待审核', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已拒绝', value: 3 }
]

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    paginationReactive.page = page
    fetchVehicles()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    fetchVehicles()
  },
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
})



// 获取车辆列表
const fetchVehicles = async () => {
  try {
    loading.value = true;
    
    // 构建查询参数（后端使用0基础的页码）
    const params: any = {
      page: paginationReactive.page - 1, // 前端页码从1开始，后端从0开始
      size: paginationReactive.pageSize
    };
    
    // 只添加非空的筛选条件
    if (filterForm.licensePlate?.trim()) {
      params.licensePlate = filterForm.licensePlate.trim();
    }
    if (filterForm.auditStatus) {
      params.auditStatus = filterForm.auditStatus;
    }
    
    console.log('发送API请求:', { url: '/api/admin/vehicles', params });
    
    const response = await api.vehicles.getList(params);
    
    console.log('API响应数据:', response);
    
    // 处理标准分页响应格式
    if (response && response.content && Array.isArray(response.content)) {
      vehicles.value = response.content;
      paginationReactive.itemCount = response.totalElements || 0;
      
      console.log('解析后的数据:', { 
        dataList: response.content.length, 
        totalCount: response.totalElements,
        currentPage: response.page,
        pageSize: response.size,
        firstItem: response.content[0] 
      });
    } else {
      console.warn('API响应格式不符合预期:', response);
      vehicles.value = [];
      paginationReactive.itemCount = 0;
    }
  } catch (error) {
    console.error('获取车辆列表失败:', error);
    message.error('获取车辆列表失败，请稍后重试');
    vehicles.value = [];
    paginationReactive.itemCount = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  paginationReactive.page = 1;
  fetchVehicles();
};

// 重置
const handleReset = () => {
  filterForm.licensePlate = '';
  filterForm.auditStatus = '';
  paginationReactive.page = 1;
  fetchVehicles();
};

// 操作函数
const showDetails = (row: any) => {
  selectedVehicle.value = row;
  showDetail.value = true;
};

// 获取状态颜色
const getStatusColor = (type: string) => {
  const colorMap: Record<string, string> = {
    warning: '#f0a020',
    success: '#18a058',
    error: '#d03050',
    default: '#666'
  };
  return colorMap[type] || colorMap.default;
};

// 获取审核状态文本和颜色
const getAuditStatusInfo = (status: number) => {
  const statusMap: Record<number, { text: string; type: string }> = {
    1: { text: '待审核', type: 'warning' },
    2: { text: '已通过', type: 'success' },
    3: { text: '已拒绝', type: 'error' },
  };
  return statusMap[status] || { text: '未知状态', type: 'default' };
};

// 获取审核状态文本
const getAuditStatusText = (status: number) => {
  return getAuditStatusInfo(status).text;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 表格列
const columns = [
  { title: "车辆ID", key: "vehicleId", width: 80 },
  { title: "车牌号", key: "licensePlate", width: 120 },
  { title: "司机ID", key: "driverId", width: 80 },
  { title: "燃油水平", key: "fuelLevel", width: 100, render: (row) => `${row.fuelLevel}%` },
  { title: "状况ID", key: "conditionId", width: 80 },
  { 
    title: "审核状态", 
    key: "auditStatus", 
    width: 100,
    render: (row) => {
      const status = getAuditStatusInfo(row.auditStatus);
      return h('span', { style: { color: getStatusColor(status.type) } }, status.text);
    }
  },
  { title: "创建时间", key: "createdAt", width: 160, render: (row) => formatDate(row.createdAt) },
  { title: "更新时间", key: "updatedAt", width: 160, render: (row) => formatDate(row.updatedAt) },
  {
    title: "操作",
    key: "actions",
    width: 120,
    render(row: any) {
      return h(
        "div",
        { style: { display: "flex", gap: "8px" } },
        [
          h(
            NButton,
            {
              size: "small",
              type: "primary",
              ghost: true,
              onClick: () => showDetails(row)
            },
            { default: () => "查看详情" }
          )
        ]
      )
    }
  }
];

// 组件挂载时获取数据
onMounted(() => {
  fetchVehicles();
});
</script>
