import { useEffect, useState } from 'react';
import "./index.scss"

import LineChart from '../../components/lineChart'
import BarChart from '../../components/barChart'
import PieChart from '../../components/pieChart'
import Table from './components/table'

import {
  UpOutlined,
  DownOutlined,
  ShopOutlined,
  MoneyCollectOutlined,
  PieChartOutlined,
  BankOutlined,
  AccountBookFilled
} from '@ant-design/icons';
import {
  Button,
  Input,
  ConfigProvider,
  Modal,
  Space,
  InputNumber,
  message
} from 'antd';
import type {
  // GetProps,
  InputNumberProps
} from 'antd';
import {
  createStyles
} from 'antd-style';
import { useColorModeStore } from '../../store/store';

import request from '../../api';

const { Search } = Input;
// type SearchProps = GetProps<typeof Input.Search>;

const useStyle = createStyles(({ token }) => ({
  'my-modal-body': {
    // background: token.blue1,
    padding: token.paddingSM,
  },
  'my-modal-mask': {
    boxShadow: `inset 0 0 15px #fff`,
  },
  'my-modal-header': {
    borderBottom: `1px dotted ${token.colorPrimary}`,
  },
  'my-modal-footer': {
    color: "#f5222d",
  },
  'my-modal-content': {
    border: '1px solid #333',
  },
}));

interface DataType {
  key: string;
  orderId: string;
  orderTime: string;
  orderType: string;
  balance: string;
  status: string;
  operate: string;
}

// 后端返回的财务记录数据类型
interface BackendFinancialRecord {
  financialId: number;
  userId: number;
  role: string;
  transactionType: string;
  amount: number;
  transactionTime: string;
}

// 后端API响应类型
interface FinancialApiResponse {
  code: number;
  data: BackendFinancialRecord[];
}

export default function benefit() {

  // const current_turnover = [
  //   { day: '2025-7-13', value: 220 },
  //   { day: '2025-7-14', value: 170 },
  //   { day: '2025-7-15', value: 210 },
  //   { day: '2025-7-16', value: 230 },
  //   { day: '2025-7-17', value: 200 },
  //   { day: '2025-7-18', value: 250 },
  //   { day: '2025-7-19', value: 240 },
  // ]

  // const current_balance = [
  //   { month: '2025/01', value: 5820 },
  //   { month: '2025/02', value: 5250 },
  //   { month: '2025/03', value: 5720 },
  //   { month: '2025/04', value: 6870 },
  //   { month: '2025/05', value: 6610 },
  //   { month: '2025/06', value: 6240 },
  //   { month: '2025/07', value: 6300 },
  // ]

  // 使用API获取数据，初始状态使用默认数据
  const [current_turnover, setCurrent_turnover] = useState([
    { day: '2025-7-13', value: 0 },
    { day: '2025-7-14', value: 0 },
    { day: '2025-7-15', value: 0 },
    { day: '2025-7-16', value: 0 },
    { day: '2025-7-17', value: 0 },
    { day: '2025-7-18', value: 0 },
    { day: '2025-7-19', value: 0 },
  ]);

  const [current_balance, setCurrent_balance] = useState([
    { month: '2025/01', value: 0 },
    { month: '2025/02', value: 0 },
    { month: '2025/03', value: 0 },
    { month: '2025/04', value: 0 },
    { month: '2025/05', value: 0 },
    { month: '2025/06', value: 0 },
    { month: '2025/07', value: 0 },
  ]);

  const [current_order, setCurrent_order] = useState([
    { type: '网约车', value: 0 },
    { type: '同城配送', value: 0 },
    { type: '紧急医疗', value: 0 },
    { type: '路况监控', value: 0 },
    { type: '移动零售', value: 0 },
    { type: '能源交易', value: 0 }
  ]);

  const [loading, setLoading] = useState(false);

  // 获取API数据
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 并行调用五个API
      const [turnoverResponse, balanceResponse, financeResponse, orderDistributionResponse, withdrawableBalanceResponse] = await Promise.all([
        request.getTurnoverDays({}),
        request.getTurnoverMonths({}),
        request.getFinanceInfo({}),
        request.getMonthlyOrderTypeDistribution({}),
        request.getWithdrawableBalance({})
      ]);

      console.log('API响应 - 营业额数据:', turnoverResponse);
      console.log('API响应 - 收入数据:', balanceResponse);
      console.log('API响应 - 财务记录数据:', financeResponse);
      console.log('API响应 - 订单分布数据:', orderDistributionResponse);

      // 根据API响应格式更新数据
      if (turnoverResponse) {
        // 根据实际API响应结构调整
        const turnoverData = turnoverResponse.data || turnoverResponse;
        setCurrent_turnover(Array.isArray(turnoverData) ? turnoverData : []);
      }
      
      if (balanceResponse) {
        // 根据实际API响应结构调整
        const balanceData = balanceResponse.data || balanceResponse;
        if (Array.isArray(balanceData)) {
          // 转换API返回的数据格式：将day字段转换为month字段
          const convertedBalanceData = balanceData.map(item => ({
            month: item.day.replace('-', '/'), // 将"2025-04"转换为"2025/04"
            value: item.value
          }));
          setCurrent_balance(convertedBalanceData);
        } else {
          setCurrent_balance([]);
        }
      }

      // 处理财务记录数据
      if (financeResponse) {
        const financeData = financeResponse.data || financeResponse;
        if (Array.isArray(financeData)) {
          const mappedData = mapBackendDataToFrontend(financeData);
          setTableData(mappedData);
        } else {
          setTableData([]);
        }
      }

      // 处理订单类型分布数据
      if (orderDistributionResponse) {
        const orderData = orderDistributionResponse.data || orderDistributionResponse;
        if (Array.isArray(orderData)) {
          setCurrent_order(orderData);
        } else {
          setCurrent_order([]);
        }
      }

      // 处理可提现余额数据
      if (withdrawableBalanceResponse) {
        const balanceData = withdrawableBalanceResponse.data || withdrawableBalanceResponse;
        if (balanceData && balanceData.withdrawableBalance !== undefined) {
          set_balance_to_withdraw(balanceData.withdrawableBalance);
        } else {
          set_balance_to_withdraw(0);
        }
      }

    } catch (error) {
      console.error('API调用失败:', error);
      // API失败时设置为空数组
      setCurrent_turnover([]);
      setCurrent_balance([]);
      setCurrent_order([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户信息（银行卡号）
  const fetchUserProfile = async () => {
    try {
      const response = await request.getProfile({});
      if (response && response.data) {
        const bankCard = response.data.bankCard || '';
        set_bank_card_number(bankCard);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      set_bank_card_number('');
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchData();
    fetchUserProfile();
  }, []);

  // 使用API获取的订单类型分布数据
  // const current_order = [
  //   { type: '网约车', value: 18 },
  //   { type: '同城配送', value: 23 },
  //   { type: '紧急医疗', value: 12 },
  //   { type: '路况监控', value: 29 },
  //   { type: '移动零售', value: 15 },
  //   { type: '能源交易', value: 21 }
  // ]

  // const current_reputation = [
  //   { month: '2025-6', value: 94 },
  //   { month: '2025-7', value: 96 },
  // ];

  const [balance_to_withdraw, set_balance_to_withdraw] = useState(0);
  const [bank_card_number, set_bank_card_number] = useState('');

  // 示例数据（已注释）
  // const [tableData, setTableData] = useState<DataType[]>([
  //   {
  //     key: '1',
  //     orderId: 'ORD001',
  //     orderTime: '2025-07-12 14:30:00',
  //     orderType: "订单收入",
  //     balance: '+￥38',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '2',
  //     orderId: 'ORD002',
  //     orderTime: '2025-07-13 16:15:00',
  //     orderType: "订单收入",
  //     balance: '+￥25',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '3',
  //     orderId: 'ORD003',
  //     orderTime: '2025-07-13 19:23:00',
  //     orderType: "提现",
  //     balance: '-￥1000',
  //     status: '处理中',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '4',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '5',
  //     orderId: 'ORD005',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '6',
  //     orderId: 'ORD006',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '7',
  //     orderId: 'ORD007',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '8',
  //     orderId: 'ORD008',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '9',
  //     orderId: 'ORD009',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '10',
  //     orderId: 'ORD010',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '11',
  //     orderId: 'ORD011',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  // ]);

  // 使用API获取的真实数据
  const [tableData, setTableData] = useState<DataType[]>([]);

  // 数据映射函数：将后端数据转换为前端需要的格式
  const mapBackendDataToFrontend = (backendData: BackendFinancialRecord[]): DataType[] => {
    return backendData.map((item, index) => {
      // 交易类型映射
      const getOrderType = (transactionType: string) => {
        switch (transactionType) {
          case 'Withdrawal':
            return '提现';
          case 'Income':
            return '订单收入';
          case 'Deposit':
            return '充值';
          default:
            return '其他';
        }
      };

      // 金额格式化
      const formatBalance = (amount: number, transactionType: string) => {
        const prefix = transactionType === 'Withdrawal' ? '-' : '+';
        return `${prefix}￥${amount.toFixed(2)}`;
      };

      // 时间格式化
      const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).replace(/\//g, '-');
      };

      // 状态映射（根据业务逻辑设定）
      const getStatus = (transactionType: string) => {
        // 这里可以根据实际业务逻辑调整
        return transactionType === 'Withdrawal' ? '处理中' : '已完成';
      };

      return {
        key: (index + 1).toString(),
        orderId: `FIN${item.financialId.toString().padStart(3, '0')}`,
        orderTime: formatTime(item.transactionTime),
        orderType: getOrderType(item.transactionType),
        balance: formatBalance(item.amount, item.transactionType),
        status: getStatus(item.transactionType),
        operate: '· · ·',
      };
    });
  };

  // 安全地获取数据，防止数组为空时出错
  const turnover_yesterday = current_turnover.length > 5 ? current_turnover[5]?.value || 0 : 0;
  const turnover_today = current_turnover.length > 6 ? current_turnover[6]?.value || 0 : 0;
  const turnover_change = turnover_yesterday > 0 ? (turnover_today - turnover_yesterday) / turnover_yesterday * 100 : 0;
  
  // 修复：查找当前月份的数据，而不是依赖固定索引
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}/${currentMonth.toString().padStart(2, '0')}`;
  
  // 查找当前月份的数据
  const currentMonthData = current_balance.find(item => item.month === currentMonthStr);
  const balance_this_month = currentMonthData ? currentMonthData.value : 0;
  
  // 计算及几个月的总值
  const balance_these_month = current_balance.reduce((acc, cur) => acc + cur.value, 0);

  const balance_change = balance_these_month - balance_these_month
  
  const order_this_month = current_order.reduce((acc, cur) => acc + cur.value, 0);

  // 检查是否有收入数据
  const hasRevenueData = balance_this_month > 0 || turnover_today > 0;
  const hasRecentMonthData = balance_these_month > 0;
  const emptyStateMessage = "近期还没有订单\n派出车辆来获取收益吧~";
  // const reputation_last_month = current_reputation[0].value;
  // const reputation_this_month = current_reputation[1].value;
  // const reputation_calculate = (reputation_this_month / 100) * 5;
  // const reputation_change = (reputation_this_month - reputation_last_month);

  // const onSearch: SearchProps['onSearch'] = (value: any, _e: any, info: { source: any }) => console.log(info?.source, value);
  const clickButton = () => {
    toggleModal(0, true)
  }

  const [isModalOpen, setIsModalOpen] = useState([false, false]);
  const { styles } = useStyle();

  const toggleModal = (idx: number, target: boolean) => {
    setIsModalOpen((p) => {
      p[idx] = target;
      return [...p];
    });
  };

  const classNames = {
    body: styles['my-modal-body'],
    mask: styles['my-modal-mask'],
    header: styles['my-modal-header'],
    footer: styles['my-modal-footer'],
    content: styles['my-modal-content'],
  };

  const modalStyles = {
    header: {
      borderLeft: `5px solid #f5222d`,
      borderRadius: 0,
      paddingInlineStart: 5,
    },
    body: {
      // boxShadow: 'inset 0 0 5px #999',
      borderRadius: 5,
    },
    mask: {
      // backdropFilter: 'blur(10px)',
    },
    footer: {
      borderTop: '1px solid #333',
    },
    content: {
      boxShadow: '0 0 30px #999',
    },
  };

  const [value_to_withdraw, set_value_to_withdraw] = useState(1000);
  const [balance_has_withdrawn, set_balance_has_withdrawn] = useState(0);

  const onChange: InputNumberProps['onChange'] = (value) => {
    console.log('changed', value);
    set_value_to_withdraw(parseInt(value?.toString() ?? '0') as number);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const handleWithdraw = () => {
    if (value_to_withdraw > balance_to_withdraw) {
      alert('提现金额不能大于可提现余额');
      return;
    }

    set_balance_to_withdraw(balance_to_withdraw - value_to_withdraw);
    set_balance_has_withdrawn(balance_has_withdrawn + value_to_withdraw);

    // orderKey是需要改的！！！！
    const orderKey = (tableData.length + 1).toString();
    const now = new Date();
    const formattedDate = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');

    const newOrder = {
      key: orderKey,
      orderId: 'ORD00' + orderKey,
      orderTime: formattedDate,
      orderType: "提现",
      balance: '-￥' + value_to_withdraw.toString(),
      status: '处理中', // 初始状态
      operate: '· · ·',
    };

    setTableData(prevData => [...prevData, newOrder]);

    messageApi
      .open({
        type: 'loading',
        content: '正在处理提现...',
        duration: 2.5,
      })
      .then(() => {
        setTableData(prevData => {
          const updatedData = [...prevData];
          const lastIndex = updatedData.length - 1;
          updatedData[lastIndex] = {
            ...updatedData[lastIndex],
            status: '已完成',
          };
          return updatedData;
        });

        return messageApi.open({
          type: 'success',
          content: '提现成功！',
          duration: 2.5,
        });
      });

    toggleModal(0, false);
  };


  const isNightMode = useColorModeStore(state => state.isNightMode);
  const toggleColorMode = useColorModeStore(state => state.toggleColorMode);

  // 昼夜模式应用函数
  const applyNightModeClasses = () => {
    const rowItems = document.querySelectorAll('.row-item');
    rowItems.forEach(item => {
      if (isNightMode) {
        item.classList.add('night-mode');
      } else {
        item.classList.remove('night-mode');
      }
    });
  };

  // 主要应用逻辑 - 响应昼夜模式变化
  useEffect(() => {
    applyNightModeClasses();
  }, [isNightMode]);

  // 页面加载时强制应用昼夜模式 - 解决初始化问题
  useEffect(() => {
    // 立即应用一次
    applyNightModeClasses();
    
    // DOM完全渲染后多次应用
    const timer1 = setTimeout(applyNightModeClasses, 100);
    const timer2 = setTimeout(applyNightModeClasses, 300);
    const timer3 = setTimeout(applyNightModeClasses, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);


  return (
    <div className="benefit-container">
      <div className="row first-row">
        <div className="row-item">
          <p className="item-title">
            <ShopOutlined style={{ marginRight: '5px' }} />
            每日营业额
          </p>
          {turnover_change >= 0 ? (
            <p className="change-rate">
              <UpOutlined
                style={{
                  color: '#70c774'
                }}
              />
              <span className="change-number green">{Math.abs(turnover_change).toFixed(2)}%</span>
            </p>
          ) : (
            <p className="change-rate">
              <DownOutlined
                style={{
                  color: '#f5222d'
                }}
              />
              <span className="change-number red">{Math.abs(turnover_change).toFixed(2)}%</span>
            </p>
          )}
          {hasRevenueData ? (
            <><div
              className="item-number"
              style={{ color: '#4c76f7' }}
            >￥{current_turnover.length > 4 ? (current_turnover[4]?.value || 0).toFixed(2) : '0.00'}</div><LineChart
                data={current_turnover} /></>
          ) : (
            <div className="empty-state-container">
              <div className="empty-state-message">{emptyStateMessage}</div>
            </div>
          )}
        </div>
        <div className="row-item">
          <p className="item-title">
            <MoneyCollectOutlined style={{ marginRight: '5px' }} />
            本月收入
          </p>
          {hasRecentMonthData ? (
            <><span
              className="item-number"
              style={{ color: '#97c8a0' }}
            >￥{balance_this_month.toFixed(2)}</span><BarChart
                data={current_balance} /></>
          ) : (
            <div className="empty-state-container">
              <div className="empty-state-message">{emptyStateMessage}</div>
            </div>
          )}
        </div>

        <div className="row-item">
          <p className="item-title">
            <PieChartOutlined style={{ marginRight: '5px' }} />
            本月订单数
          </p>
          {hasRevenueData ? (
            <>
              <span
                className="item-number"
                style={{ color: '#ffc658' }}
              >{order_this_month}单</span>
              <PieChart
                data={current_order}
              // data1={current_comments}
              // width={600}
              // height={400}
              />
            </>
          ) : (
            <div className="empty-state-container">
              <div className="empty-state-message">{emptyStateMessage}</div>
            </div>
          )}
        </div>
        <div className="row-item">
          <p className="item-title">
            <BankOutlined style={{ marginRight: '5px' }} />
            可提现余额
          </p>
          <span
            className="item-number"
            style={{ color: '#8a84d3' }}
          >￥{balance_to_withdraw}</span>
          <span
            style={{
              color: '#8a84d3',
              fontSize: '14px',
              marginTop: '10px',
            }}
          >本轮已提现：￥{balance_has_withdrawn}</span>
          <Button
            // type="primary"
            onClick={clickButton}
            style={{
              // backgroundColor: '#8a84d3',
              marginTop: '90px',
            }}
            color="purple"
            variant="solid"
          >
            <AccountBookFilled />
            立即提现
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="row-item table-row">
          <div className="table-title">
            <div className="table-title-item">
              收益明细
            </div>
            <div className="table-search-item">
              {/* <SearchOutlined className="search-icon" /> */}
              <Search
                className="search-icon"
                placeholder="input order id"
                // onSearch={onSearch}
                enterButton
              />
            </div>
          </div>
          <Table data={tableData} />
        </div>
      </div>

      <Modal
        title="提现金额"
        open={isModalOpen[0]}
        onOk={() => toggleModal(0, false)}
        onCancel={() => toggleModal(0, false)}
        footer="立即提现"
        classNames={classNames}
        styles={modalStyles}
      >
        {contextHolder}
        <Space>
          <InputNumber<number>
            defaultValue={balance_to_withdraw > 1000 ? 1000 : balance_to_withdraw}
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
            onChange={onChange}
            style={{
              width: '200px',
              margin: '10px 0',
            }}
          />
        </Space>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#555',
            margin: '10px 0',
            display: 'flex',
            flexDirection: 'row',
          }}
        >可提现余额：
          <div
            style={{
              color: '#f5222d',
            }}
          >￥{balance_to_withdraw.toFixed(2)}</div>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: '#555',
            margin: '10px 0',
          }}
        >
          提现至工商银行：{bank_card_number.slice(-4).padStart(bank_card_number.length, '*')}
        </p>
        <Button
          color="danger"
          variant="solid"
          onClick={handleWithdraw}
        >立即提现</Button>
        <Button
          color="danger"
          variant="dashed"
          style={{ marginLeft: '20px' }}
          onClick={() => toggleModal(0, false)}
        >取消提现</Button>
      </Modal>
      <ConfigProvider
        modal={{
          classNames,
          styles: modalStyles,
        }}
      >
        <Modal
          title="Basic Modal"
          open={isModalOpen[1]}
          onOk={() => toggleModal(1, false)}
          onCancel={() => toggleModal(1, false)}
          footer="Footer"
        >
          <Space>
            <InputNumber<number>
              defaultValue={balance_to_withdraw > 1000 ? 1000 : balance_to_withdraw}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
              onChange={onChange}
              style={{
                width: '200px',
                margin: '10px 0',
              }}
            />
          </Space>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#555',
              margin: '10px 0',
              display: 'flex',
              flexDirection: 'row',
            }}
          >可提现余额：
            <div
              style={{
                color: '#f5222d',
              }}
            >￥{balance_to_withdraw.toFixed(2)}</div>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: '#555',
              margin: '10px 0',
            }}
          >
            提现至工商银行：{bank_card_number.slice(-4).padStart(bank_card_number.length, '*')}
          </p>
          <Button
            color="danger"
            variant="solid"
          >立即提现</Button>
          <Button
            color="danger"
            variant="dashed"
            style={{ marginLeft: '20px' }}
            onClick={() => toggleModal(1, false)}
          >取消提现</Button>
        </Modal>
      </ConfigProvider>
    </div>
  );
}
