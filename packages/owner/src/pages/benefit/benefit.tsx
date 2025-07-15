import "../../style/benefit.scss"

import LineChart from '../../components/lineChart'
import BarChart from '../../components/barChart'
import Table from './components/table'

import {
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import {
  Button,
  Rate,
  Input
} from 'antd';
import type { GetProps } from 'antd';

const { Search } = Input;

type SearchProps = GetProps<typeof Input.Search>;

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

  const balance_to_withdraw = 3562.35;

  const current_reputation = [
    { month: '2025-6', value: 94 },
    { month: '2025-7', value: 96 },
  ];

  const current_balance = [
    { month: '2025-1', value: 5820 },
    { month: '2025-2', value: 5250 },
    { month: '2025-3', value: 5720 },
    { month: '2025-4', value: 6870 },
    { month: '2025-5', value: 6610 },
    { month: '2025-6', value: 6240 },
    { month: '2025-7', value: 6300 },
  ]

  const turnover_yesterday = current_turnover[5].value;
  const turnover_today = current_turnover[6].value;
  const turnover_change = (turnover_today - turnover_yesterday) / turnover_yesterday * 100;
  const reputation_last_month = current_reputation[0].value;
  const reputation_this_month = current_reputation[1].value;
  const reputation_calculate = (reputation_this_month / 100) * 5;
  const reputation_change = (reputation_this_month - reputation_last_month);
  const balance_this_month = current_balance[6].value;

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

  return (
    <div className="benefit-container">
      <div className="row first-row">
        <div className="row-item">
          <p className="item-title">每日营业额</p>
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
          <div className="item-number">￥{ current_turnover[4].value.toFixed(2) }</div>
          <LineChart
            data={current_turnover}
            width={600}
            height={400}
          />
        </div>
        <div className="row-item">
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
        </div>
        <div className="row-item">
          <p className="item-title">本月收入</p>
          <span className="item-number">￥{ balance_this_month.toFixed(2) }</span>
          <BarChart
            data={current_balance}
            width={600}
            height={400}
          />
        </div>
      </div>
      <div className="row">
        <div className="row-item">
          <div className="table-title">
            <div className="table-title-item">
              收益明细
            </div>
            <div className="table-search-item">
              {/* <SearchOutlined className="search-icon" /> */}
              <Search
                className="search-icon"
                placeholder="input order id"
                onSearch={onSearch}
                enterButton
              />
            </div>
          </div>
          <Table />
        </div>
      </div>
    </div>
  );
}
