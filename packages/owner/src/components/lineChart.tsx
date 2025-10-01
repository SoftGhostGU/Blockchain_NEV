import { useEffect, useState } from "react";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area
} from "recharts";

interface LineChartProps {
  data: any;
  // width: number;
  // height: number;
}

const lineChart: React.FC<LineChartProps> = ({ data }) => {
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
      const newHeight = Math.max((window.innerHeight * 0.32 - 132), 100);
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

      <AreaChart data={transformedData} width={width} height={height}
        margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4c76f7" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4c76f7" stopOpacity={0} />
          </linearGradient>
          {/* <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient> */}
        </defs>
        <XAxis dataKey="day" hide={true} />
        <YAxis hide={true} />
        <CartesianGrid strokeDasharray="0 3" />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#4c76f7" fillOpacity={1} fill="url(#colorUv)" />
        {/* <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" /> */}
      </AreaChart>
    </div>
  );
};

export default lineChart;