import { useEffect, useState } from "react";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from "recharts";

interface BarChartProps {
  data: any;
}

const barChart: React.FC<BarChartProps> = ({ data }) => {
  const minValue = Math.min(...data.map((item: { value: any; }) => item.value));
  const transformedData = data.map((item: { value: number; day: string }) => ({
    ...item,
    value: item.value - minValue,
  }));

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.max((window.innerWidth * 0.84 - 30) / 4 - 70, 100);
      const newHeight = Math.max((window.innerHeight * 0.32 - 92), 100);
      setWidth(newWidth);
      setHeight(newHeight);
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

      <BarChart width={width} height={height} data={transformedData}>
        <CartesianGrid strokeDasharray="0 1" />
        <XAxis dataKey="month" style={{ fontSize: 12 }} />
        <YAxis hide={true} />
        <Tooltip />
        {/* <Legend /> */}
        {/* <Bar dataKey="pv" fill="#8884d8" /> */}
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

export default barChart;