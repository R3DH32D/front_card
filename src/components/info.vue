<template>
  <div class="min-h-screen flex flex-col">
 <main class="container mx-auto flex-1 flex mt-4 info">
      <aside class="w-1/5 bg-gray-100 p-4 shadow-md" style="max-height: 80vh; overflow-y: auto; border-radius: 20px;"> <!-- Added border-radius -->
        <div class="mb-4 flex">
          <input type="text" placeholder="Поиск..." class="w-full p-2 border rounded-l" v-model="searchQuery">
          <button class="bg-green-500 text-white p-2 rounded-r w-24" @click="search"> <!-- Увеличена ширина кнопки -->
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
      <section class="w-3/5 bg-blue-200 p-4" style="max-height: 80vh; overflow-y: auto; border-radius: 20px;"> <!-- Added border-radius -->
        <!-- Main content goes here -->
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Info'
}

</script>

<style scoped>
.info-body {
  display: flex;
  width: 50%;
  height: 100%;
}

.left-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f0f0f0;
  overflow-y: auto;
}

.right-block {
  flex: 1;
  background-color: #ffffff;
}

.search-block {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

.search-button {
  padding: 10px;
  background-color: #4CAF50;
  border: 1px solid #4CAF50;
  color: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.filter-block {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}
</style>