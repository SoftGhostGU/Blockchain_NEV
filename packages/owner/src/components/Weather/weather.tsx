import './WeatherDisplay.scss'
import Sun from '../../assets/sunny.png'
import Cloud from '../../assets/cloud.png'
import Rain from '../../assets/rain.png'
import Snow from '../../assets/snow.png'
import Wind from '../../assets/wind.png'
import Lightning from '../../assets/lightning.png'
import { useEffect, useState } from 'react'
import { useColorModeStore } from '../../store/store'

const WeatherDisplay = () => {
  const mockData = [
    {
      "date": "2025-08-12",
      "week": "2",
      "dayweather": "小雨",
      "nightweather": "阴",
      "daytemp": "36",
      "nighttemp": "28",
      "daywind": "南",
      "nightwind": "南",
      "daypower": "1-3",
      "nightpower": "1-3",
      "daytemp_float": "36.0",
      "nighttemp_float": "28.0"
    },
    {
      "date": "2025-08-13",
      "week": "3",
      "dayweather": "阴",
      "nightweather": "阴",
      "daytemp": "35",
      "nighttemp": "28",
      "daywind": "南",
      "nightwind": "南",
      "daypower": "1-3",
      "nightpower": "1-3",
      "daytemp_float": "35.0",
      "nighttemp_float": "28.0"
    },
    {
      "date": "2025-08-14",
      "week": "4",
      "dayweather": "阴",
      "nightweather": "阴",
      "daytemp": "35",
      "nighttemp": "28",
      "daywind": "东南",
      "nightwind": "东南",
      "daypower": "1-3",
      "nightpower": "1-3",
      "daytemp_float": "35.0",
      "nighttemp_float": "28.0"
    },
    {
      "date": "2025-08-15",
      "week": "5",
      "dayweather": "阴",
      "nightweather": "阴",
      "daytemp": "35",
      "nighttemp": "28",
      "daywind": "东南",
      "nightwind": "东南",
      "daypower": "1-3",
      "nightpower": "1-3",
      "daytemp_float": "35.0",
      "nighttemp_float": "28.0"
    }
  ]

  const [weatherData, setWeatherData] = useState<any>(mockData);

  const rawData = async () => {
    try {
      const response = await fetch("https://restapi.amap.com/v3/weather/weatherInfo?key=36a1801282c415f96427dc945e39a027&city=310000&extensions=all");
      if (!response.status === "1") {
        console.error("Failed to fetch weather data");
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      console.log("data: ", data);
      setWeatherData(data.forecasts[0].casts);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    rawData();
  }, []);

  useEffect(() => {
    console.log("weatherData: ", weatherData);
  }, [weatherData]);

  const handleWeatherPicture = (weather: string) => {
    if (weather.includes('晴')) {
      return Sun
    } else if (weather.includes('雨')) {
      return Rain
    } else if (weather.includes('雪')) {
      return Snow
    } else if (weather.includes('雷')) {
      return Lightning
    } else if (weather.includes('风')) {
      return Wind
    } else {
      return Cloud
    }
  }

  const isNightMode = useColorModeStore(state => state.isNightMode);
  useEffect(() => {
    const weatherDescription = document.querySelector('.weather-description');
    if (isNightMode) {
      weatherDescription?.classList.add('night-mode');
      // console.log("切换到夜间模式");
    } else {
      weatherDescription?.classList.remove('night-mode');
      // console.log("切换到日间模式");
    }
  }, [isNightMode]);

  return (
    <div className="weather-container">
      <div className="weather-row">
        <div className="main-weather-info">
          <div className='weather-icon'>
            <img
              src={handleWeatherPicture(weatherData[0].dayweather)}
              alt='weather-icon'
              style={{
                width: '80px',
                height: '50px',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
          <div className='weather-temperature'>{((Number(weatherData[0].daytemp_float) + Number(weatherData[0].nighttemp_float)) / 2).toFixed(1)}℃</div>
          <div className='weather-description'>{weatherData[0].dayweather}</div>
        </div>
        <div className="today-weather-info">
          <div className='temperature-range'>气温：{weatherData[0].nighttemp}~{weatherData[0].daytemp}°C</div>
          <div className='wind-direction'>风向：{weatherData[0].daywind}风</div>
          <div className='wind-speed'>风力：{weatherData[0].daypower}级</div>
        </div>
      </div>
      <div className="weather-row">
        {
          weatherData.map((day: any, index: any) => (
            <div key={index} className='forcast-weather-info'>
              <div className='forcast-day'>
                <div className='forcast-date'>{day.date.split('-')[1]}-{day.date.split('-')[2]}</div>
                <div className='forcast-icon'>
                  <img
                    src={handleWeatherPicture(day.dayweather)}
                    alt='weather-icon'
                    style={{
                      width: '50px',
                      height: '30px',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                </div>
                <div className='forcast-temperature'>{((Number(day.daytemp_float) + Number(day.nighttemp_float)) / 2).toFixed(1)}℃</div>
              </div>
            </div>
          ))
        }

      </div>
    </div>
  )
}

export default WeatherDisplay;
