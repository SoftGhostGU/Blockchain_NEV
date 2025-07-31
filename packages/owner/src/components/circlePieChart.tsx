import React, { useEffect, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

interface CirclePieChartProps {
  data: Array<{ star: number; count: number }>;
}

type PieSectorDataItem = React.SVGProps<SVGPathElement> & {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: any;
  percent?: number;
  value?: number;
};

const renderActiveShape = (props: PieSectorDataItem) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * (midAngle ?? 0));
  const cos = Math.cos(-RADIAN * (midAngle ?? 0));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy !== undefined ? cy - 10 : 0} dy={8} textAnchor="middle" fill={fill} fontSize={16}>
        {payload.star}星
      </text>
      <text x={cx} y={cy !== undefined ? cy + 5 : 0} dy={8} textAnchor="middle" fill={fill} fontSize={12}>
        {`占比 ${((percent ?? 0) * 100).toFixed(2)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
      {/* <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {`数量 ${value}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`占比 ${((percent ?? 0) * 100).toFixed(2)}%`}
      </text> */}
    </g>
  );
};

const CirclePieChart: React.FC<CirclePieChartProps> = ({ data }) => {
  const [_activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.max(((window.innerWidth * 0.84 - 30) * 30 % - 50), 100);
      const newHeight = Math.max(((window.innerHeight - 162) / 3 - 66), 100);
      setWidth(newWidth);
      setHeight(newHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // 转换数据格式以匹配PieChart的要求
  const chartData = data.map(item => ({
    star: item.star,
    value: item.count
  }));

  return (
    <div style={{ width: '100%', height: 'calc(100%)' }}>
      <ResponsiveContainer>
        <PieChart
          width={width}
          height={height}
        >
          <Pie
            // activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CirclePieChart;