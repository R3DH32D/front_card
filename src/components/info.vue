<template>
  <div class="min-h-screen flex flex-col">
    <main class="container mx-auto flex-1 flex mt-4 info">
      <!-- Sidebar -->
      <aside class="w-1/5 bg-gray-100 p-4 shadow-md" style="max-height: 80vh; overflow-y: auto; border-radius: 20px;"> 
        <div class="mb-4 flex">
          <input type="text" placeholder="Поиск..." class="w-full p-2 border rounded-l" v-model="searchQuery">
          <button class="bg-green-500 text-white p-2 rounded-r w-24" @click="search">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div class="mb-4">
          <input type="text" placeholder="Фильтр 1" class="w-full p-2 border rounded" v-model="filter1">
        </div>
        <div>
          <input type="text" placeholder="Фильтр 2" class="w-full p-2 border rounded" v-model="filter2">
        </div>
      </aside>

      <!-- Map Section -->
      <section id="container" class="w-3/5 bg-blue-200" style="height: 80vh; border-radius: 20px;">
        <!-- Карта появится здесь -->
      </section>
    </main>
  </div>
</template>   

<script>
export default {
  name: 'Info',
  data() {
    return {
      searchQuery: '',
      filter1: '',
      filter2: '',
    }; 
  },
  mounted() {
    // Инициализация карты в элементе #container
    const map = new mapgl.Map('container', {
      center: [104.261007,52.262506 ], // Координаты центра (Москва)
      zoom: 17, // Масштаб
      key: '793f92c3-a4e6-483b-8fdb-edc8c24895ce', 
    });
    window.addEventListener('resize', () => {
    map.invalidateSize();
    });
    // Пример добавления маркера
    new mapgl.Marker(map, {
      coordinates: [37.6173, 55.7558], // Координаты маркера
      icon: 'https://docs.2gis.com/img/favicon-192x192.png', // Иконка маркера
    });
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
