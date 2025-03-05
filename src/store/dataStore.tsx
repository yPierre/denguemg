import { create } from "zustand";
import { adaptCityData } from '../utils/dataAdapter';

type DataType = 'absolute' | 'per100k' | 'weekly' | 'accumulated';

export interface CityWeekData {
  city: string;
  geocode: number;
  casos: number;
  p_rt1: number;
  p_inc100k: number;
  nivel: number;
  nivel_inc: number;
  Rt: number;
  pop: number;
  tempmin: number;
  tempmed: number;
  tempmax: number;
  umidmin: number;
  umidmed: number;
  umidmax: number;
  receptivo: number;
  transmissao: number;
  notif_accum_year: number;
}

export interface Week{
  SE: number;
  casos: number;
  p_rt1: number;
  p_inc100k: number;
  nivel: number;
  nivel_inc: number;
  Rt: number;
  pop: number;
  tempmin: number;
  tempmed: number;
  tempmax: number;
  umidmin: number;
  umidmed: number;
  umidmax: number;
  receptivo: number;
  transmissao: number;
  notif_accum_year: number;
}

export interface CityData {
  city: string;
  geocode: number;
  casos: number;
  nivel: number;
  p_inc100k: number;
  data: Week[];
}

export interface StateData {
  SE: number;
  total_week_cases: number;
  total_pop: number;
  cities_in_alert_state: number;
  total_notif_accum_year: number;
  cities: CityWeekData[];
}

interface DataState {
  stateData: StateData[] | null;
  cityData: CityData[] | null;
  selectedCity: string | null;
  loading: boolean;
  loadingCity: boolean;
  dataType: DataType;
  fetchStateData: () => Promise<void>;
  fetchCityData: (city: string) => Promise<void>;
  setSelectedCity: (city: string | null) => void;
  setDataType: (type: DataType) => void;
  
}

export const useDataStore = create<DataState>((set) => ({
  stateData: null,
  cityData: null,
  dataType: 'absolute',
  selectedCity: null,
  loading: false,
  loadingCity: false,
  setDataType: (type) => set({ dataType: type }),

  // Busca os dados do estado
  fetchStateData: async () => {
    set({ loading: true });
    try {
      const response = await fetch("api/state");
      const data = await response.json();
      set({ stateData: data, loading: false });
    } catch (error) {
      console.error("Erro ao buscar dados do estado:", error);
      set({ loading: false });
    }
  },

  // Busca os dados da cidade
  fetchCityData: async (city) => {
    set({ loadingCity: true });
    //console.log("City(fetchCityData):", city);
    try {
      const response = await fetch(`/api/state?city=${city}`);
      const data = await response.json();
      const adaptedData = adaptCityData(city, data);
      console.log("CityData(dataStore):", adaptedData); // Verifique se os dados estão chegando
      set({ cityData: [adaptedData], loadingCity: false });
    } catch (error) {
      console.error("Erro ao buscar dados da cidade(dataStore):", error);
      set({ loadingCity: false });
    }
  },

  // Define a cidade selecionada
  setSelectedCity: (city) => {
    //console.log("Cidade selecionada(dataStore):", city);
    set({ selectedCity: city });
    if (city) {
      useDataStore.getState().fetchCityData(city); // Busca os dados da cidade
    } else {
      set({ cityData: null }); // Limpa os dados da cidade
    }
  },
}));