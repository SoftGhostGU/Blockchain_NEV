import { useState } from 'react';
import "../../style/benefit.scss"

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
} from 'antd';
import type {
  // GetProps,
  InputNumberProps
} from 'antd';
import {
  createStyles
} from 'antd-style';

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

const onChange: InputNumberProps['onChange'] = (value) => {
  console.log('changed', value);
};

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

  const balance_to_withdraw = 5370;
  const bank_card_number = '6222026000000000001';


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
        {/* <div className="row-item">
          <p className="item-title">可提现余额</p>
          <span className="item-number">￥{ balance_to_withdraw.toFixed(2) }</span>
          <Button
            color="primary"
            variant="solid"
            className="withdraw-btn"
          >立即提现</Button>
        </div>
        <div className="row-item">
          <p className="item-title">信誉分</p>
          <span className="item-number">{ reputation_this_month }</span>
          <Rate
            disabled
            allowHalf
            // character="hcy" 
            defaultValue={reputation_calculate}
            className="reputation-star"
          />
          {reputation_change > 0 ? (
            <p className="change-reputation">
              <UpOutlined
                style={{
                  color: '#70c774'
                }}
              />
              <span className="change-number green">较上月提升了{Math.abs(reputation_change)}分</span>
            </p>
          ) : (
            <p className="change-reputation">
              <DownOutlined
                style={{
                  color: '#f5222d'
                }}
              />
              <span className="change-number red">较上月下降了{Math.abs(reputation_change)}分</span>
            </p>
          )}
        </div> */}
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
          >本月已提现：￥0.00</span>
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
          <Table />
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
        >立即提现</Button>
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
          >立即提现</Button>
        </Modal>
      </ConfigProvider>
    </div>
  );
}
