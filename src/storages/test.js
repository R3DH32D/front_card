import axios from "axios";
import { defineStore } from "pinia";
export const usetestStorage = defineStore("testeStore", {
  state: () => ({
    

  }),

  actions: {
    async getRoomFromApi() {
      // console.log("получаем институты")
      axios.post("https://routing.api.2gis.com/routing/7.0.0/global?key=793f92c3-a4e6-483b-8fdb-edc8c24895ce", {body : {
        
            "points": [
                {
                    "type": "stop",
                    "lon": 52.263245,
                    "lat": 104.260802
                },
                {
                    "type": "stop",
                    "lon": 37.579206,
                    "lat": 55.774362
                }
            ],
            "locale": "ru",
            "transport": "car",
            "route_mode": "fastest",
            "traffic_mode": "jam"
        
      }})
      .then((response) => {
          this.Room = response.data;
        });
    },
    
    
  }
})