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
      const newWidth = Math.max((window.innerWidth * 0.84 - 30) * 30 % - 50, 100);
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
          innerRadius={40}
          outerRadius={55}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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