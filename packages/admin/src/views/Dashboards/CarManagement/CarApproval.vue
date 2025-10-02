<template>
  <div style="padding: 16px; height: 100vh; display: flex; flex-direction: column;">
    <!-- 页面头部 -->
    <n-page-header
      title="车辆审批"
      subtitle="审批新注册的车辆"
      style="flex-shrink: 0;"
    />
    
    <!-- 筛选表单 -->
    <n-card title="车辆筛选" style="margin: 16px 0; flex-shrink: 0;">
      <n-form
        ref="filterFormRef"
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

    <!-- 车辆列表 -->
    <n-card title="车辆列表" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
      <n-data-table
        :columns="columns"
        :data="vehicleList"
        :loading="loading"
        :pagination="paginationReactive"
        :bordered="false"
        :single-line="false"
        flex-height
        style="height: 100%;"
        remote
      />
    </n-card>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showApprovalModal" preset="dialog" title="车辆审核">
      <template #header>
        <div>车辆审核</div>
      </template>
      <div v-if="currentVehicle">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="车辆ID">
            {{ currentVehicle.vehicleId }}
          </n-descriptions-item>
          <n-descriptions-item label="车牌号">
            {{ currentVehicle.licensePlate }}
          </n-descriptions-item>
          <n-descriptions-item label="司机ID">
            {{ currentVehicle.driverId }}
          </n-descriptions-item>
          <n-descriptions-item label="燃油水平">
            {{ currentVehicle.fuelLevel }}%
          </n-descriptions-item>
          <n-descriptions-item label="状况ID">
            {{ currentVehicle.conditionId }}
          </n-descriptions-item>
          <n-descriptions-item label="审核状态">
            {{ getAuditStatusText(currentVehicle.auditStatus) }}
          </n-descriptions-item>
          <n-descriptions-item label="车辆清洁度">
            {{ currentVehicle.carCleanliness || '暂无数据' }}
          </n-descriptions-item>
          <n-descriptions-item label="车辆类型">
            {{ currentVehicle.carType || '暂无数据' }}
          </n-descriptions-item>
          <n-descriptions-item label="纬度">
            {{ currentVehicle.lat || '暂无数据' }}
          </n-descriptions-item>
          <n-descriptions-item label="经度">
            {{ currentVehicle.lon || '暂无数据' }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatDate(currentVehicle.createdAt) }}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            {{ formatDate(currentVehicle.updatedAt) }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <n-form ref="approvalFormRef" :model="approvalForm">
          <n-form-item label="审核意见" path="remark">
            <n-input
              v-model:value="approvalForm.remark"
              type="textarea"
              placeholder="请输入审核意见（可选）"
              :rows="3"
            />
          </n-form-item>
        </n-form>

        <!-- AI建议 -->
        <n-card title="AI审核建议" size="small" style="margin-top: 16px">
          <n-spin :show="aiLoading">
            <div v-if="aiSuggestion" style="white-space: pre-wrap">
              {{ aiSuggestion }}
            </div>
            <div v-else style="color: #999">
              点击"获取AI建议"按钮获取智能审核建议
            </div>
          </n-spin>
          <template #action>
            <n-button size="small" @click="getAISuggestion" :loading="aiLoading">
              获取AI建议
            </n-button>
          </template>
        </n-card>
      </div>

      <template #action>
        <n-space>
          <n-button @click="showApprovalModal = false">取消</n-button>
          <n-button type="error" @click="handleReject" :loading="approvalLoading">
            拒绝
          </n-button>
          <n-button type="success" @click="handleApprove" :loading="approvalLoading">
            通过
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NFormItemGi,
  NGrid,
  NInput,
  NSelect,
  NButton,
  NSpace,
  NIcon,
  NDataTable,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NSpin,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type SelectOption
} from 'naive-ui';
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5';
import { api } from '@/api';

// 消息提示
const message = useMessage();

// 表单引用
const filterFormRef = ref<FormInst | null>(null);
const approvalFormRef = ref<FormInst | null>(null);

// 筛选表单
const filterForm = reactive({
  licensePlate: '',
  auditStatus: ''
});

// 审核表单
const approvalForm = reactive({
  remark: ''
});

// 审核状态选项（根据后端数据：1=待审核，2=已通过）
const auditStatusOptions: SelectOption[] = [
  { label: '待审核', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已拒绝', value: 0 }
];

// 数据状态
const loading = ref(false);
const vehicleList = ref<any[]>([]);
const showApprovalModal = ref(false);
const currentVehicle = ref<any>(null);
const approvalLoading = ref(false);
const aiLoading = ref(false);
const aiSuggestion = ref('');

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    paginationReactive.page = page;
    fetchVehicles();
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize;
    paginationReactive.page = 1;
    fetchVehicles();
  },
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
});

// 表格列配置
const columns: DataTableColumns<any> = [
  {
    title: '车辆ID',
    key: 'vehicleId',
    width: 80
  },
  {
    title: '车牌号',
    key: 'licensePlate',
    width: 120
  },
  {
    title: '司机ID',
    key: 'driverId',
    width: 80
  },
  {
    title: '燃油水平',
    key: 'fuelLevel',
    width: 100,
    render: (row) => `${row.fuelLevel}%`
  },
  {
    title: '状况ID',
    key: 'conditionId',
    width: 80
  },
  {
    title: '审核状态',
    key: 'auditStatus',
    width: 100,
    render: (row) => {
      const statusMap: Record<number, { text: string; type: string }> = {
        1: { text: '待审核', type: 'warning' },
        2: { text: '已通过', type: 'success' },
        3: { text: '已拒绝', type: 'error' },
      };
      const status = statusMap[row.auditStatus] || { text: '未知', type: 'default' };
      return h('span', { style: { color: getStatusColor(status.type) } }, status.text);
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDate(row.createdAt)
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 160,
    render: (row) => formatDate(row.updatedAt)
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) => {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => openApprovalModal(row),
                disabled: row.auditStatus === 2 // 已通过的不能再审核
              },
              { default: () => row.auditStatus === 2 ? '已审核' : '审核' }
            )
          ]
        }
      );
    }
  }
];

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

// 获取审核状态文本
const getAuditStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '已拒绝',
    1: '待审核',
    2: '已通过'
  };
  return statusMap[status] || '未知状态';
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

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
      vehicleList.value = response.content;
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
      vehicleList.value = [];
      paginationReactive.itemCount = 0;
    }
  } catch (error) {
    console.error('获取车辆列表失败:', error);
    message.error('获取车辆列表失败，请稍后重试');
    vehicleList.value = [];
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

// 打开审核弹窗
const openApprovalModal = (vehicle: any) => {
  currentVehicle.value = vehicle;
  approvalForm.remark = '';
  aiSuggestion.value = '';
  showApprovalModal.value = true;
};

// 获取AI建议
const getAISuggestion = async () => {
  if (!currentVehicle.value) return;
  
  try {
    aiLoading.value = true;
    // 模拟AI建议（实际项目中应该调用真实的AI接口）
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const vehicle = currentVehicle.value;
    let suggestion = `基于车辆信息分析：\n\n`;
    suggestion += `1. 车辆ID：${vehicle.vehicleId}\n`;
    suggestion += `2. 车牌号：${vehicle.licensePlate}\n`;
    suggestion += `3. 司机ID：${vehicle.driverId}\n`;
    suggestion += `4. 燃油水平：${vehicle.fuelLevel}% - ${vehicle.fuelLevel > 50 ? '良好' : '需要关注'}\n`;
    suggestion += `5. 状况ID：${vehicle.conditionId}\n`;
    suggestion += `6. 当前状态：${getAuditStatusText(vehicle.auditStatus)}\n`;
    suggestion += `7. 车辆清洁度：${vehicle.carCleanliness || '暂无数据'}\n`;
    suggestion += `8. 车辆类型：${vehicle.carType || '暂无数据'}\n\n`;
    
    // 基于实际数据给出建议
    if (vehicle.auditStatus === 2) {
      suggestion += `建议：该车辆已通过审核，无需重复审核。`;
    } else if (vehicle.auditStatus === 0) {
      suggestion += `建议：该车辆已被拒绝，如需重新审核请先了解拒绝原因。`;
    } else if (vehicle.fuelLevel > 70) {
      suggestion += `建议：车辆燃油水平良好，建议通过审核。`;
    } else {
      suggestion += `建议：车辆燃油水平较低，建议要求司机加油后再审核。`;
    }
    
    aiSuggestion.value = suggestion;
  } catch (error) {
    console.error('获取AI建议失败:', error);
    message.error('获取AI建议失败，请稍后重试');
  } finally {
    aiLoading.value = false;
  }
};

// 审核通过
const handleApprove = async () => {
  if (!currentVehicle.value) return;
  
  try {
    approvalLoading.value = true;
    
    const data: any = {};
    if (approvalForm.remark?.trim()) {
      data.remark = approvalForm.remark.trim();
    }
    
    // 使用统一的audit接口，status=2表示已通过
    await api.vehicles.audit(currentVehicle.value.vehicleId, 2, data);
    
    message.success('审核通过成功');
    showApprovalModal.value = false;
    fetchVehicles(); // 刷新列表
  } catch (error) {
    console.error('审核通过失败:', error);
    message.error('审核通过失败，请稍后重试');
  } finally {
    approvalLoading.value = false;
  }
};

// 审核拒绝
const handleReject = async () => {
  if (!currentVehicle.value) return;
  
  try {
    approvalLoading.value = true;
    
    const data: any = {};
    if (approvalForm.remark?.trim()) {
      data.remark = approvalForm.remark.trim();
    }
    
    // 使用统一的audit接口，status=3表示已拒绝
    await api.vehicles.audit(currentVehicle.value.vehicleId, 3, data);
    
    message.success('审核拒绝成功');
    showApprovalModal.value = false;
    fetchVehicles(); // 刷新列表
  } catch (error) {
    console.error('审核拒绝失败:', error);
    message.error('审核拒绝失败，请稍后重试');
  } finally {
    approvalLoading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchVehicles();
});
</script>

<style scoped>
.n-card {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

/* 确保表格容器正确显示 */
:deep(.n-data-table) {
  height: 100%;
}

:deep(.n-data-table-base-table) {
  height: 100%;
}

:deep(.n-data-table-base-table-body) {
  height: calc(100% - 40px); /* 减去表头高度 */
}
</style>