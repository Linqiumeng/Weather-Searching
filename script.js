// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    initWeatherApp();
});

function initWeatherApp() {
    // 获取DOM元素
    const searchInput = document.querySelector('.js-search');
    const searchButton = document.querySelector('.js-search-button');
    const mainWeatherInfo = document.querySelector('.js-main');
    const tempInfo = document.querySelector('.temp');
    const otherInfo = document.querySelector('.other-info');
    const weatherEmoji = document.querySelector('.css-weather-emoji img');
    
    if (!searchInput || !searchButton) {
        console.error('无法找到搜索元素');
        return;
    }
    
    // 为搜索按钮添加事件监听器
    searchButton.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            // 首先获取城市的地理坐标
            getCoordinates(city);
        } else {
            alert('请输入城市名称');
        }
    });

    // 添加回车键搜索功能
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) {
                getCoordinates(city);
            } else {
                alert('请输入城市名称');
            }
        }
    });

    // 通过Open-Meteo的地理编码API获取城市坐标
    async function getCoordinates(cityName) {
        try {
            // 添加国家代码US以限定美国城市，增加结果数量以便找到最佳匹配
            const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=zh&format=json&country=US`;
            
            const response = await fetch(geocodingUrl);
            
            if (!response.ok) {
                throw new Error('无法获取城市坐标');
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // 尝试找到名称完全匹配的城市（不区分大小写）
                const exactMatch = data.results.find(
                    city => city.name.toLowerCase() === cityName.toLowerCase()
                );
                
                // 如果找到精确匹配，使用它；否则使用第一个结果
                const result = exactMatch || data.results[0];
                const { latitude, longitude, name } = result;
                
                // 显示找到的城市名，以便用户确认
                console.log(`找到城市: ${name}`);
                
                // 获取到坐标后，查询天气
                getWeatherData(latitude, longitude, name);
            } else {
                alert('未找到该美国城市，请检查拼写或尝试其他城市');
            }
        } catch (error) {
            console.error('获取坐标时出错:', error);
            alert('获取城市信息失败，请稍后再试');
        }
    }

    // 使用Open-Meteo API获取天气数据
    async function getWeatherData(latitude, longitude, cityName) {
        try {
            // 构建API URL，包含我们需要的天气变量
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York`;
            
            const response = await fetch(weatherUrl);
            
            if (!response.ok) {
                throw new Error('无法获取天气数据');
            }
            
            const data = await response.json();
            
            // 显示天气信息
            displayWeatherInfo(data, cityName);
        } catch (error) {
            console.error('获取天气数据时出错:', error);
            alert('获取天气数据失败，请稍后再试');
        }
    }

    // 显示天气信息
    function displayWeatherInfo(data, cityName) {
        const current = data.current;
        const daily = data.daily;
        
        // 获取当前天气代码和天气描述
        const weatherCode = current.weather_code;
        const weatherDescription = getWeatherDescription(weatherCode);
        
        // 更新主要天气信息
        mainWeatherInfo.innerHTML = `
            <p>城市: ${cityName}</p>
            <p>今日天气: ${weatherDescription}</p>
        `;
        
        // 更新温度信息
        tempInfo.innerHTML = `
            <p>今日温度:</p>
            <p>当前: ${current.temperature_2m}${data.current_units.temperature_2m}</p>
            <p>最高: ${daily.temperature_2m_max[0]}${data.daily_units.temperature_2m_max}</p>
            <p>最低: ${daily.temperature_2m_min[0]}${data.daily_units.temperature_2m_min}</p>
        `;
        
        // 更新其他信息
        otherInfo.innerHTML = `
            <p>今日湿度: ${current.relative_humidity_2m}${data.current_units.relative_humidity_2m}</p>
            <p>风速: ${current.wind_speed_10m}${data.current_units.wind_speed_10m}</p>
        `;
        
        // 更新天气图标
        updateWeatherEmoji(weatherCode);
    }

    // 根据天气代码更新天气表情图标
    function updateWeatherEmoji(weatherCode) {
        // 这里你可以根据天气代码选择适当的图标
        // 简单示例，你可以扩展这个功能
        let emojiSrc = '';
        
        // WMO Weather interpretation codes (WW)
        // https://open-meteo.com/en/docs
        if (weatherCode === 0) { // 晴天
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/6974/6974833.png';
        } else if (weatherCode >= 1 && weatherCode <= 3) { // 多云
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png';
        } else if (weatherCode >= 45 && weatherCode <= 48) { // 雾
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png';
        } else if ((weatherCode >= 51 && weatherCode <= 55) || 
                (weatherCode >= 61 && weatherCode <= 65) ||
                (weatherCode >= 80 && weatherCode <= 82)) { // 雨
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/3351/3351979.png';
        } else if ((weatherCode >= 71 && weatherCode <= 77) || 
                (weatherCode >= 85 && weatherCode <= 86)) { // 雪
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/642/642102.png';
        } else if (weatherCode >= 95 && weatherCode <= 99) { // 雷暴
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/1779/1779963.png';
        } else { // 默认
            emojiSrc = 'https://cdn-icons-png.flaticon.com/512/1779/1779940.png';
        }
        
        weatherEmoji.src = emojiSrc;
    }
}

// 根据天气代码获取天气描述
function getWeatherDescription(weatherCode) {
    // WMO Weather interpretation codes (WW)
    const weatherDescriptions = {
        0: '晴天',
        1: '晴间多云',
        2: '多云',
        3: '阴天',
        45: '雾',
        48: '沉积雾霜',
        51: '小毛毛雨',
        53: '中毛毛雨',
        55: '大毛毛雨',
        56: '冻毛毛雨',
        57: '强冻毛毛雨',
        61: '小雨',
        63: '中雨',
        65: '大雨',
        66: '冻雨',
        67: '强冻雨',
        71: '小雪',
        73: '中雪',
        75: '大雪',
        77: '雪粒',
        80: '小阵雨',
        81: '中阵雨',
        82: '强阵雨',
        85: '小雪阵雪',
        86: '大阵雪',
        95: '雷暴',
        96: '雷暴伴随小冰雹',
        99: '雷暴伴随大冰雹'
    };
    
    return weatherDescriptions[weatherCode] || '未知天气';
}