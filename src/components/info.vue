<template>
  <div class="min-h-screen flex flex-col">
    <main class="container mx-auto flex-1 flex mt-4 info">
      <!-- Боковая панель -->
      <aside class="w-1/5 bg-gray-100 p-4 shadow-md" style="max-height: 85vh; overflow-y: auto; border-radius: 20px;">
        <div class="mb-4 flex">
          <input
            type="text"
            placeholder="Введите стартовые координаты (lon,lat)"
            class="w-full p-2 border rounded-l"
            v-model="searchQuery"
          />
          <button
            class="bg-green-500 text-white p-2 rounded-r w-24"
            @click="handleBuildRoute"
          >
            Построить
          </button>
        </div>
        <div class="mb-4">
          <input type="text" placeholder="Фильтр 1" class="w-full p-2 border rounded" v-model="filter1" />
        </div>
        <div>
          <input type="text" placeholder="Фильтр 2" class="w-full p-2 border rounded" v-model="filter2" />
        </div>
      </aside>

      <!-- Контейнер для SVG -->
      <section class="w-3/5 bg-blue-200 p-4 relative" style="max-height: 85vh; min-width: 80%; overflow-y: auto; border-radius: 20px;">
        <!-- Кнопки переключения этажей -->
        <div class="floor-buttons">
          <button
            v-for="(floor, index) in floors"
            :key="index"
            :class="['floor-button', { active: currentFloor === floor }]"
            @click="setCurrentFloor(floor)"
          >
            {{ floor }}
          </button>
        </div>
        <!-- Отображение SVG -->
        <div v-if="currentFloor !== null">
          <h1>Этаж {{ currentFloor }}</h1>
          <img
            v-if="svgPath"
            :src="svgPath"
            alt="SVG Example"
            class="rotated"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { load } from '@2gis/mapgl';
import axios from 'axios';

export default {
  name: 'SvgMapWithApi',
  setup() {
    const searchQuery = ref('');
    const filter1 = ref('');
    const filter2 = ref('');
    const floors = [0, 1, 2, 3]; 
    const currentFloor = ref(1);
    const svgPath = ref('');

    const setCurrentFloor = (floor) => {
      currentFloor.value = floor;
      updateSvgPath();
    };

    const updateSvgPath = () => {
      try {
        svgPath.value = require(`@/assets/test${currentFloor.value}.svg`);
      } catch (e) {
        console.error(`Файл для этажа ${currentFloor.value} не найден.`, e);
        svgPath.value = ''; // Очистка пути, если файл не найден
      }
    };

    const handleBuildRoute = () => {
      if (!searchQuery.value) {
        alert('Введите координаты в формате "lon,lat"!');
        return;
      }

      const coords = searchQuery.value.split(',').map(Number);
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        alert('Некорректный формат координат! Используйте "lon,lat".');
        return;
      }

      buildRoute(coords); // Вызываем логику построения маршрута
    };

    const buildRoute = async (startCoordinates) => {
      const endpoint =
        'https://routing.api.2gis.com/routing/7.0.0/global?key=793f92c3-a4e6-483b-8fdb-edc8c24895ce';
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
      };

      try {
        const response = await axios.post(endpoint, body, {
          headers: { 'Content-Type': 'application/json' },
        });

        let routes = response.data.result.routes;
        console.log('Ответ API:', routes);

        if (!routes || routes.length === 0) {
          console.error('Маршруты не найдены!');
          return;
        }

        const route = routes[0];
        const coordinates = route.geometry.points.map(([lon, lat]) => [lon, lat]);
        console.log('Координаты маршрута:', coordinates);

        if (coordinates.length > 0) {
          drawRoute(coordinates); 
        }
      } catch (error) {
        console.error('Ошибка при построении маршрута:', error.response?.data || error.message);
      }
    };

    const drawRoute = (coordinates) => {
      if (routeLayer) {
        routeLayer.destroy();
      }

      
      console.log('Рисуем маршрут:', coordinates);
    };

    
    onMounted(async () => {
      
      updateSvgPath();
    });

    return {
      searchQuery,
      filter1,
      filter2,
      floors,
      currentFloor,
      svgPath,
      setCurrentFloor,
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
}

.rotated {
  display: block;
  margin: 10px auto;
  max-width: 100%;
  width: 480px;
  height: auto;
  transform: rotate(270deg);
}

.floor-buttons {
  position: absolute;
  top: 10%;
  left: 5%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.floor-button {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
}

.floor-button.active {
  background: #4caf50;
  color: white;
  font-weight: bold;
}
</style>
