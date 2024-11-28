<template>
  <div>
    <!-- Поля ввода координат стартовой точки -->
    <input
      v-model="searchQuery"
      placeholder="Введите стартовые координаты (lon,lat)"
      style="margin-bottom: 10px;"
    />
    <button
      @click="handleBuildRoute"
    >
      Построить маршрут
    </button>

    <!-- Контейнер карты -->
    <div>
    <h1>Static SVG</h1>
    <img :src="require('@/assets/test.svg')" alt="SVG Example"class="rotated" />
 
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { load } from '@2gis/mapgl';
import axios from 'axios';

export default {
  name: 'Info',
  setup() {
    const searchQuery = ref(''); // ref для ввода координат
    const mapContainer = ref(null);
    let map = null;
    let routeLayer = null;

    // Функция для обработки клика кнопки
    const handleBuildRoute = () => {
      console.log('searchQuery:', searchQuery.value); // Логируем значение searchQuery

      if (!searchQuery.value) {
        alert('Введите координаты в формате "lon,lat"!');
        return;
      }

      const coords = searchQuery.value.split(',').map(Number); // Разделяем координаты
      console.log('Parsed coordinates:', coords); // Проверяем результат

      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        alert('Некорректный формат координат! Используйте "lon,lat".');
        return;
      }

      buildRoute(coords); // Вызываем построение маршрута
    };

    const buildRoute = async (startCoordinates) => {
  const endpoint = 'https://routing.api.2gis.com/routing/7.0.0/global?key=793f92c3-a4e6-483b-8fdb-edc8c24895ce';
  const body = {
    points: [
      {
        type: 'stop',
        lon: startCoordinates[0],
        lat: startCoordinates[1],
        floor_id: '1',
      },
      {
        type: 'stop',
        lon: 104.260802,
        lat: 52.263245,
        floor_id: '1',
      },
    ],
    locale: 'ru',
    transport: 'walking',
    route_mode: 'fastest',
    traffic_mode: 'jam',

    params: {
    pedestrian: {
      use_indoor: false, // Построение маршрута внутри зданий (по умолчанию false)
      use_instructions: false, // Выдача инструкций по маршруту
    },
  },
};

  try {
    const response = await axios.post(endpoint, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    let routes = response.data; // API возвращает массив
    routes = routes.result
    console.log('Полный ответ API:', routes);

    // Проверяем, есть ли маршруты
    if (!routes || routes.length === 0) {
      console.error('Маршруты не найдены!');
      return;
    }

    const route = routes[0]; // Берем первый маршрут
    console.log('Выбранный маршрут:', route);

    // Проверяем, есть ли маневры
    const maneuvers = route.maneuvers;
    if (!maneuvers || maneuvers.length === 0) {
      console.error('Маневры не найдены в маршруте!');
      return;
    }

    // Извлечение геометрии из maneuvers[0].outcoming_path.geometry
    const geometryData = maneuvers[0]?.outcoming_path?.geometry || [];
    const coordinates = geometryData.flatMap((path) => {
      const match = path.selection.match(/LINESTRING\((.+)\)/);
      if (match) {
        return match[1].split(',').map((coord) => {
          const [lon, lat] = coord.trim().split(' ').map(Number);
          return [lon, lat];
        });
      }
      return [];
    });

    console.log('Координаты маршрута:', coordinates);

    if (coordinates.length > 0) {
      drawRoute(coordinates); // Отрисовываем маршрут
    } else {
      console.error('Не удалось извлечь координаты маршрута!');
    }
  } catch (error) {
    console.error('Ошибка при построении маршрута:', error.response?.data || error.message);
  }
};
const drawRoute = (coordinates) => {
  if (routeLayer) {
    routeLayer.destroy();
  }

  routeLayer = new mapgl.Polyline(map, {
    coordinates, // Массив координат
    width: 5,
    color: '#FF0000',
  });

  map.setBounds(routeLayer.getBounds());
};

    onMounted(async () => {
      if (mapContainer.value) {
        const mapgl = await load();
        map = new mapgl.Map(mapContainer.value, {
          center: [104.261007, 52.262506],
          zoom: 17,
          key: '793f92c3-a4e6-483b-8fdb-edc8c24895ce',
        });

        window.addEventListener('resize', () => {
          map.invalidateSize();
        });
      } else {
        console.error('mapContainer не найден');
      }
    });

    return {
      searchQuery,
      mapContainer,
      handleBuildRoute,
    };
  },
};

</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; 
}

.min-h-screen {
  height: 100vh;
}

.container {
  display: flex;
  height: 100%;
}

#container {
  height: 100%;
  position: relative;
}
</style>
