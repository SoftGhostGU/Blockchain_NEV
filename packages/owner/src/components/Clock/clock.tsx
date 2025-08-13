import React, { useEffect, useRef, useState } from 'react';
import './clock.scss';
import { useColorModeStore } from '../../store/store';

export const Clock = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<Date>(new Date(0));
  const [currentDate, setCurrentDate] = useState('');
  const tickStateRef = useRef(true);

  // 获取日期
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long', // 8月
        day: 'numeric', // 13日
      });
      // 这里 toLocaleDateString 在 zh-CN 会直接是 "2025年8月13日"
      setCurrentDate(formatter.format(now));
    };

    updateDate(); // 初始化
    const dateTimer = setInterval(updateDate, 60 * 1000); // 每分钟更新一次
    return () => clearInterval(dateTimer);
  }, []);

  // 获取时间：xx:xx:xx
  useEffect(() => {
    if (!boardRef.current) return;

    // 初始化元素引用
    const hoursContainer = boardRef.current.querySelector('.hours') as HTMLElement;
    const minutesContainer = boardRef.current.querySelector('.minutes') as HTMLElement;
    const secondsContainer = boardRef.current.querySelector('.seconds') as HTMLElement;
    const tickElements = Array.from(boardRef.current.querySelectorAll('.tick')) as HTMLElement[];

    // 设置初始时间为-1确保首次更新
    lastTimeRef.current.setUTCHours(-1);

    // 冒号闪烁效果
    const tick = () => {
      tickElements.forEach(t => t.classList.toggle('tick-hidden'));
      tickStateRef.current = !tickStateRef.current;
    };

    // 更新数字动画
    const updateNumber = (element: HTMLElement, number: string) => {
      const second = element.lastElementChild!.cloneNode(true) as HTMLElement;
      second.textContent = number;
      element.appendChild(second);
      element.classList.add('move');

      setTimeout(() => {
        element.classList.remove('move');
      }, 975);

      setTimeout(() => {
        element.removeChild(element.firstElementChild!);
      }, 975);
    };

    // 更新时间显示
    const updateContainer = (container: HTMLElement, newTime: string) => {
      const time = newTime.split('');
      if (time.length === 1) time.unshift('0');

      const first = container.firstElementChild as HTMLElement;
      if (first.lastElementChild!.textContent !== time[0]) {
        updateNumber(first, time[0]);
      }

      const last = container.lastElementChild as HTMLElement;
      if (last.lastElementChild!.textContent !== time[1]) {
        updateNumber(last, time[1]);
      }
    };

    // 主更新函数
    const updateTime = () => {
      const now = new Date();
      const last = lastTimeRef.current;

      const lastHours = last.getHours().toString();
      const nowHours = now.getHours().toString();
      if (lastHours !== nowHours) {
        updateContainer(hoursContainer, nowHours);
      }

      const lastMinutes = last.getMinutes().toString();
      const nowMinutes = now.getMinutes().toString();
      if (lastMinutes !== nowMinutes) {
        updateContainer(minutesContainer, nowMinutes);
      }

      const lastSeconds = last.getSeconds().toString();
      const nowSeconds = now.getSeconds().toString();
      if (lastSeconds !== nowSeconds) {
        updateContainer(secondsContainer, nowSeconds);
      }

      lastTimeRef.current = now;
    };

    // 启动定时器
    const timeInterval = setInterval(updateTime, 100);
    // const tickInterval = setInterval(tick, 500);

    // 初始更新
    updateTime();

    return () => {
      clearInterval(timeInterval);
      // clearInterval(tickInterval);
    };
  }, []);

  const isNightMode = useColorModeStore(state => state.isNightMode);
    useEffect(() => {
      const clock = document.querySelectorAll('.clock');
      if (isNightMode) {
        clock.forEach(item => { item.classList.add('night-mode'); });
        console.log("切换到夜间模式");
      } else {
        clock.forEach(item => { item.classList.remove('night-mode'); });
        console.log("切换到日间模式");
      }
    }, [isNightMode]);

  return (
    <main id="board" ref={boardRef}>
      <div className='date'>
        {currentDate}
      </div>
      <div className="clock">
        <div className="hours">
          <div className="first">
            <div className="number">0</div>
          </div>
          <div className="second">
            <div className="number">0</div>
          </div>
        </div>
        <div className="tick">:</div>
        <div className="minutes">
          <div className="first">
            <div className="number">0</div>
          </div>
          <div className="second">
            <div className="number">0</div>
          </div>
        </div>
        <div className="tick">:</div>
        <div className="seconds">
          <div className="first">
            <div className="number">0</div>
          </div>
          <div className="second infinite">
            <div className="number">0</div>
          </div>
        </div>
      </div>
    </main>
  );
};