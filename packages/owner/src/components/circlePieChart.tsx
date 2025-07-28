import React from 'react';

interface CirclePieChartProps {
  data: Array<{ star: number; count: number }>;
}

const CirclePieChart: React.FC<CirclePieChartProps> = ({ data }) => {
  return (
    <div>
      {/* 示例：遍历 data 数组并渲染 */}
      {data.map((item, index) => (
        <div key={index}>
          星级 {item.star}: {item.count}
        </div>
      ))}
    </div>
  );
};

export default CirclePieChart;
