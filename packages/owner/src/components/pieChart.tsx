import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PieChartProps {
  data: any;
  // width: number;
  // height: number;
}

const pieChart: React.FC<PieChartProps> = ({ data }) => {
  // const minValue = Math.min(...data.map((item: { value: any; }) => item.value));
  // const transformedData = data.map((item: { value: number; day: string }) => ({
  //   ...item,
  //   value: item.value - minValue + 50,
  // }));

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.max((window.innerWidth * 0.84 - 30) / 4 - 70, 100);
      const newHeight = Math.max((window.innerHeight * 0.32 - 132), 100);
      setWidth(newWidth);
      setHeight(newHeight * 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {/* <p>图表数据: {JSON.stringify(data)}</p>
        <p>图表宽度: {width}px</p>
        <p>图表高度: {height}px</p> */}

      <PieChart width={width} height={height}>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#f9b328ff"
          label={({ type }) => `${type}`}
          style={{
            fontSize: 12,
          }}
        />
        <Tooltip
          formatter={(value) => [
            `${value}`
          ]}
          contentStyle={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
      </PieChart>
    </div>
  );
};

export default pieChart;