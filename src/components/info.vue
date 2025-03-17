<template>
  <div class="min-h-screen flex flex-col">
    <main class="container mx-auto flex-1 flex mt-4 info">
      <!-- Боковая панель -->
      <aside class="w-1/5 bg-gray-100 p-4 shadow-md" style="max-height: 85vh; overflow-y: auto; border-radius: 20px;">
        <div class="mb-4 flex">
          <input type="text" placeholder="Введите кабинет" class="w-full p-2 border rounded-l" v-model="searchQuery" />
          <button class="bg-green-500 text-white p-2 rounded-r w-24" @click="highlightRoom">
            найти
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
      <section id="svg-container" ref="svgContainer" class="svg-container">
        <div class="svg-wrapper" v-if="svgContent" v-html="svgContent"></div>
        <div class="floor-buttons">
          <button v-for="(floor, index) in floors" :key="index"
            :class="['floor-button', { active: currentFloor === floor }]" @click="setCurrentFloor(floor)">
            {{ floor }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";

export default {
  name: "SvgMapWithApi",
  setup() {
    const searchQuery = ref(""); // Введенный кабинет
    const filter1 = ref("");
    const filter2 = ref("");
    const floors = [0, 1, 2, 3];
    const currentFloor = ref(2); // По умолчанию устанавливаем этаж 2
    const svgContent = ref("");

    // Координаты для входа и кабинета B210
    const nodes = {
      entrance: { x: 400, y: 300 },  // Координаты для входа
      B210: { x: 600, y: 450 }       // Координаты для кабинета B210
    };

    // Загрузка SVG при смене этажа
    const setCurrentFloor = (floor) => {
      currentFloor.value = floor;
      loadSvg();
    };

    const loadSvg = async () => {
      try {
        const response = await fetch(require(`@/assets/test${currentFloor.value}.svg`));
        svgContent.value = await response.text();
        drawRoute(); // Рисуем путь сразу после загрузки
      } catch (error) {
        console.error(`Ошибка загрузки SVG для этажа ${currentFloor.value}:`, error);
        svgContent.value = ""; // Очищаем содержимое при ошибке
      }
    };

    const highlightRoom = () => {
      if (!svgContent.value) return;

      const query = searchQuery.value.trim().toLowerCase();
      if (query === "") return;

      // Парсим SVG
      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(svgContent.value, "image/svg+xml");
      const svgElement = svgDocument.querySelector("svg");

      svgElement.querySelectorAll("text, tspan").forEach((el) => {
        el.removeAttribute("fill");
        el.removeAttribute("stroke");
        el.style.strokeWidth = "";
      });

      // Если найден нужный кабинет, выделяем его
      const matchingText = Array.from(svgElement.querySelectorAll("tspan")).find(
        (tspanElement) => tspanElement.textContent.trim().toLowerCase() === query
      );

      if (matchingText) {
        const matchingTextParent = matchingText.closest("text");
        if (matchingTextParent) {
          matchingTextParent.style.fill = "yellow";
          matchingTextParent.style.stroke = "orange";
          matchingTextParent.style.strokeWidth = "0.3";
        }
      } else {
        console.error(`Не найден текст: ${query}`);
      }

      // Перерисовываем SVG после выделения
      svgContent.value = new XMLSerializer().serializeToString(svgElement);
      drawRoute(); // Строим маршрут после выделения
    };

    // Функция рисования пути
    const drawRoute = () => {
      if (!svgContent.value || !searchQuery.value || currentFloor.value !== 2) return;

      const query = searchQuery.value.trim().toLowerCase();

      // Если введен кабинет "B210"
      if (query === "b210") {
        // Парсим SVG
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(svgContent.value, "image/svg+xml");
        const svgElement = svgDocument.querySelector("svg");

        // Удалим старые пути, если есть
        svgElement.querySelectorAll("path").forEach((path) => {
          path.remove();
        });

        // Получаем координаты кабинета
        const start = nodes.entrance;
        const end = nodes.B210;

        // Создаем путь от входа до кабинета B210
        const routePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        routePath.setAttribute("d", `M${start.x},${start.y} L${end.x},${end.y}`);  // Прямая линия от входа до B210
        routePath.setAttribute("stroke", "blue"); // Цвет пути
        routePath.setAttribute("stroke-width", "3"); // Толщина линии
        routePath.setAttribute("fill", "none"); // Без заливки
        svgElement.appendChild(routePath);

        // Обновляем содержимое SVG
        svgContent.value = new XMLSerializer().serializeToString(svgElement);
      }
    };

    watch(currentFloor, loadSvg);

    onMounted(() => {
      loadSvg();
    });

    return {
      searchQuery,
      filter1,
      filter2,
      floors,
      currentFloor,
      svgContent,
      setCurrentFloor,
      highlightRoom,
    };
  },
};
</script>

<style scoped>
.svg-container {
  display: flex;
  justify-content: center;
  position: relative;
  height: 85vh;
  width: 100%;
  background-color: #add8e6;
  border-radius: 20px;
  overflow: hidden;
  padding-bottom: 10%;
}

.svg-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(-90deg);  /* Поворот карты */
}

svg {
  width: 100%;
  height: auto;
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