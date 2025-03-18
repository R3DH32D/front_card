<template>
  <div class="min-h-screen flex flex-col">
    <main class="container mx-auto flex-1 flex mt-4 info">
      <!-- Боковая панель -->
      <aside class="w-1/5 bg-gray-100 p-4 shadow-md" style="max-height: 85vh; overflow-y: auto; border-radius: 20px;">
        <div class="mb-4 flex">
          <input type="text" placeholder="Введите кабинет" class="w-full p-2 border rounded-l" v-model="searchQuery"
            @input="highlightRoom" />
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
    const searchQuery = ref("");
    const filter1 = ref("");
    const filter2 = ref("");
    const floors = [0, 1, 2, 3];
    const currentFloor = ref(1);
    const svgContent = ref("");

    // Загрузка SVG при смене этажа
    const setCurrentFloor = (floor) => {
      currentFloor.value = floor;
      loadSvg();
    };

    const loadSvg = async () => {
      try {
        const response = await fetch(require(`@/assets/test${currentFloor.value}.svg`));
        svgContent.value = await response.text();
        drawRoute();
      } catch (error) {
        console.error(`Ошибка загрузки SVG для этажа ${currentFloor.value}:`, error);
        svgContent.value = ""; // Очищаем содержимое при ошибке
      }
    };

    const highlightRoom = () => {
      if (!svgContent.value) return;

      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(svgContent.value, "image/svg+xml");
      const svgElement = svgDocument.querySelector("svg");

      svgElement.querySelectorAll("text, tspan").forEach((el) => {
        el.removeAttribute("fill");
        el.removeAttribute("stroke");
        el.style.strokeWidth = "";
      });

      const query = searchQuery.value.trim().toLowerCase();
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

      svgContent.value = new XMLSerializer().serializeToString(svgElement);
      drawRoute();
    };

    const drawRoute = () => {
      if (!svgContent.value || currentFloor.value !== 2) return;

      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(svgContent.value, "image/svg+xml");
      const svgElement = svgDocument.querySelector("svg");

      const routePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      routePath.setAttribute("d", "M50,50 L100,100 L200,100 L250,150"); // Пример пути
      routePath.setAttribute("stroke", "red");
      routePath.setAttribute("stroke-width", "2");
      routePath.setAttribute("fill", "none");
      svgElement.appendChild(routePath);

      svgContent.value = new XMLSerializer().serializeToString(svgElement);
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

}

svg {
  transform: rotate(-90deg);
  transform-origin: center center;
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
