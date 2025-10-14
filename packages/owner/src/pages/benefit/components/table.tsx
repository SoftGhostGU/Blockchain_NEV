import React from 'react';
import { ConfigProvider, Table, Tag } from 'antd';
import { theme, type TableColumnsType } from 'antd';
import { useColorModeStore } from '../../../store/store';

interface DataType {
  key: string;
  orderId: string;
  orderTime: string;
  orderType: string;
  balance: string;
  status: string;
  operate: string;
}

interface AppProps {
  data: DataType[];
}

const App: React.FC<{ data: DataType[] }> = ({ data }) => {

  const isNightMode = useColorModeStore(state => state.isNightMode);

  const columns: TableColumnsType<DataType> = [
    {
      title: '订单编号',
      dataIndex: 'orderId',
      render: (text: React.ReactNode) => (
        <span style={{
          fontWeight: 'bold',
          color: isNightMode ? '#fff' : '#000',
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '交易时间',
      dataIndex: 'orderTime',
      sorter: {
        compare: (a: { orderTime: string | number | Date; }, b: { orderTime: string | number | Date; }) => {
          const timeA = new Date(a.orderTime).getTime();
          const timeB = new Date(b.orderTime).getTime();
          return timeA - timeB;
        },
        multiple: 3,
      },
      render: (text: React.ReactNode) => (
        <span style={{
          // fontWeight: 'bold',
          color: isNightMode ? '#bbb' : '#555',
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '交易类型',
      dataIndex: 'orderType',
      // sorter: {
      //   compare: (a, b) => a.math - b.math,
      //   multiple: 2,
      // },
      render: (text: React.ReactNode) => (
        <span style={{
          // fontWeight: 'bold',
          color: isNightMode ? '#bbb' : '#555',
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '金额',
      dataIndex: 'balance',
      sorter: {
        compare: (a: { balance: string; }, b: { balance: string; }) => parseInt(a.balance.split('￥')[0] + a.balance.split('￥')[1]) - parseInt(b.balance.split('￥')[0] + b.balance.split('￥')[1]),
        multiple: 1,
      },
      render: (tag: string) => (
        <span>
          {(() => {
            const color = tag.split('￥')[0] === '-' ? 'gold' : 'green';
            return (
              <Tag color={color} key={tag} bordered={false}>
                {tag.toUpperCase()}
              </Tag>
            );
          })()}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      // sorter: {
      //   compare: (a, b) => a.math - b.math,
      //   multiple: 2,
      // },
      render: (status: string) => (
        <span>
          {(() => {
            const color = status === '已完成' ? 'green' : 'gold';
            return (
              <Tag color={color} key={status} bordered={false}>
                {status.toUpperCase()}
              </Tag>
            );
          })()}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      // sorter: {
      //   compare: (a, b) => a.math - b.math,
      //   multiple: 2,
      // },
      render: (text: React.ReactNode) => (
        <span style={{
          fontWeight: 'bold',
          color: '#5871e6',
        }}>
          {text}
        </span>
      ),
    },
  ];

  // const data: DataType[] = [
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
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '6',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '7',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '8',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '9',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '10',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  //   {
  //     key: '11',
  //     orderId: 'ORD004',
  //     orderTime: '2025-07-14 10:52:00',
  //     orderType: "订单收入",
  //     balance: '+￥84',
  //     status: '已完成',
  //     operate: '· · ·',
  //   },
  // ];

  const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  // const { theme: themeState } = useAppSelector((state) => state.system)
  return (

    <ConfigProvider
      theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <Table<DataType>
        columns={columns}
        dataSource={data}
        onChange={onChange}
        scroll={{ y: 47 * 5 }}
        // style={{ height: '40vh' }}
      />
    </ConfigProvider>
  );
};

export default App;
