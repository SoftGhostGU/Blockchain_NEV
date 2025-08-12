import './AutoCrowd.scss'
import { Clock as ClockText } from '../../components/Clock/clock'
import Clock from 'react-clock';
// import { Weather } from '../../components/weather'
import { useEffect, useState, lazy, Suspense } from 'react';
import { useColorModeStore } from '../../store/store';
// import 'react-clock/dist/Clock.css';

// 懒加载天气组件
const WeatherLazy = lazy(() => import('../../components/Weather/weather'));

export default function AutoCrowd() {
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const isNightMode = useColorModeStore(state => state.isNightMode);
  useEffect(() => {
    const reactClockFace = document.querySelectorAll('.react-clock__face');
    const reactClockHandBody = document.querySelectorAll('.react-clock__hand__body');
    const reactClockMarkBody = document.querySelectorAll('.react-clock__mark__body');
    const time = document.querySelector('.time');
    const weather = document.querySelector('.weather');
    if (isNightMode) {
      reactClockFace.forEach(item => { item.classList.add('night-mode'); });
      reactClockHandBody.forEach(item => { item.classList.add('night-mode'); });
      reactClockMarkBody.forEach(item => { item.classList.add('night-mode'); });
      time?.classList.add('night-mode');
      weather?.classList.add('night-mode');
      console.log("切换到夜间模式");
    } else {
      reactClockFace.forEach(item => { item.classList.remove('night-mode'); });
      reactClockHandBody.forEach(item => { item.classList.remove('night-mode'); });
      reactClockMarkBody.forEach(item => { item.classList.remove('night-mode'); });
      time?.classList.remove('night-mode');
      weather?.classList.remove('night-mode');
      console.log("切换到日间模式");
    }
  }, [isNightMode]);

  return (
    <div>
      <div className="column-auto-crowd">
        <div className="time">
          <Clock value={value} />
          <ClockText />
        </div>
        <div className="weather">
          {/* <Weather /> */}
          <Suspense fallback={<div>加载中...</div>}>
            <WeatherLazy />
          </Suspense>
        </div>
      </div>
      <div className="column-auto-crowd">

      </div>
    </div>
  )
}