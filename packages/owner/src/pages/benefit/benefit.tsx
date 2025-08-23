import { useEffect, useState } from 'react';
import "./benefit.scss"

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

export default function benefit() {

  const current_turnover = [
    { day: '2025-7-13', value: 220 },
    { day: '2025-7-14', value: 170 },
    { day: '2025-7-15', value: 210 },
    { day: '2025-7-16', value: 230 },
    { day: '2025-7-17', value: 200 },
    { day: '2025-7-18', value: 250 },
    { day: '2025-7-19', value: 240 },
  ]


  const current_balance = [
    { month: '2025/01', value: 5820 },
    { month: '2025/02', value: 5250 },
    { month: '2025/03', value: 5720 },
    { month: '2025/04', value: 6870 },
    { month: '2025/05', value: 6610 },
    { month: '2025/06', value: 6240 },
    { month: '2025/07', value: 6300 },
  ]

  const current_order = [
    { type: '网约车', value: 18 },
    { type: '同城配送', value: 23 },
    { type: '紧急医疗', value: 12 },
    { type: '路况监控', value: 29 },
    { type: '移动零售', value: 15 },
    { type: '能源交易', value: 21 }
  ]

  // const current_reputation = [
  //   { month: '2025-6', value: 94 },
  //   { month: '2025-7', value: 96 },
  // ];

  const [balance_to_withdraw, set_balance_to_withdraw] = useState(5370);
  const bank_card_number = '6222026000000000001';

  const [tableData, setTableData] = useState<DataType[]>([
    {
      key: '1',
      orderId: 'ORD001',
      orderTime: '2025-07-12 14:30:00',
      orderType: "订单收入",
      balance: '+￥38',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '2',
      orderId: 'ORD002',
      orderTime: '2025-07-13 16:15:00',
      orderType: "订单收入",
      balance: '+￥25',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '3',
      orderId: 'ORD003',
      orderTime: '2025-07-13 19:23:00',
      orderType: "提现",
      balance: '-￥1000',
      status: '处理中',
      operate: '· · ·',
    },
    {
      key: '4',
      orderId: 'ORD004',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },

    {
      key: '5',
      orderId: 'ORD005',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '6',
      orderId: 'ORD006',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '7',
      orderId: 'ORD007',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '8',
      orderId: 'ORD008',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '9',
      orderId: 'ORD009',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '10',
      orderId: 'ORD010',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
    {
      key: '11',
      orderId: 'ORD011',
      orderTime: '2025-07-14 10:52:00',
      orderType: "订单收入",
      balance: '+￥84',
      status: '已完成',
      operate: '· · ·',
    },
  ]);

  const turnover_yesterday = current_turnover[5].value;
  const turnover_today = current_turnover[6].value;
  const turnover_change = (turnover_today - turnover_yesterday) / turnover_yesterday * 100;
  const balance_this_month = current_balance[6].value;
  const order_this_month = current_order.reduce((acc, cur) => acc + cur.value, 0);
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

  useEffect(() => {
    const rowItems = document.querySelectorAll('.row-item');
    rowItems.forEach(item => {
      if (isNightMode) {
        item.classList.add('night-mode');
        console.log("切换到夜间模式");
      } else {
        item.classList.remove('night-mode');
        console.log("切换到日间模式");
      }
    });
  }, [isNightMode]);


  return (
    <div className="benefit-container">
      <div className="row first-row">
        <div className="row-item">
          <p className="item-title">
            <ShopOutlined style={{ marginRight: '5px' }} />
            每日营业额
          </p>
          {turnover_change > 0 ? (
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
          <div
            className="item-number"
            style={{ color: '#4c76f7' }}
          >￥{current_turnover[4].value.toFixed(2)}</div>
          <LineChart
            data={current_turnover}
          // width={300}
          // height={120}
          />
        </div>
        <div className="row-item">
          <p className="item-title">
            <MoneyCollectOutlined style={{ marginRight: '5px' }} />
            本月收入
          </p>
          <span
            className="item-number"
            style={{ color: '#97c8a0' }}
          >￥{balance_this_month.toFixed(2)}</span>
          <BarChart
            data={current_balance}
          // width={600}
          // height={400}
          />
        </div>

        <div className="row-item">
          <p className="item-title">
            <PieChartOutlined style={{ marginRight: '5px' }} />
            本月订单数
          </p>
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
          >本月已提现：￥{balance_has_withdrawn}</span>
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
