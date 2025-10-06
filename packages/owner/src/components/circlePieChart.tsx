import React, { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface CirclePieChartProps {
  data: Array<{ star: number; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

const CirclePieChart: React.FC<CirclePieChartProps> = ({ data }) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.max((window.innerWidth * 0.84 - 30) * 40 % - 50, 100);
      const newHeight = Math.max((window.innerHeight - 162) / 3 - 66, 100);

      setWidth(newWidth);
      setHeight(newHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 转换数据格式以匹配PieChart的要求
  const chartData = data.map(item => ({
    name: `${item.star}星`,
    value: item.count
  }));

  // 检查是否所有数据都是0
  const hasData = chartData.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999',
        fontSize: '14px',
        fontStyle: 'italic',
        textAlign: 'center'
      }}>
        <div>近期还没有评价</div>
        <div>完成订单来获取评价吧~</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer>
      <PieChart
        width={width}
        height={height}
      >
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CirclePieChart;