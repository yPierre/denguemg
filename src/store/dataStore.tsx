import { create } from "zustand";

export type DataType = 'absolute' | 'per100k' | 'weekly' | 'accumulated';

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
  data: Week[];
}

export interface StateData {
  SE: number;
  total_week_cases: number;
  cities_in_alert_state: number;
  total_notif_accum_year: number;
  cities?: CityWeekData[];
}

interface DataState {
  stateData: StateData[] | null;
  cityData: CityData[] | null;
  selectedCity: string | null;
  loading: boolean;
  loadingCity: boolean;
  fetchStateData: () => Promise<void>;
  fetchCityData: (city: string) => Promise<void>;
  setSelectedCity: (city: string | null) => void;
  
}

// Valida o status HTTP antes de interpretar a resposta como JSON.
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Requisição falhou com status ${response.status}: ${url}`);
  }
  return response.json();
}

function isCityData(value: unknown): value is CityData {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<CityData>;
  return typeof candidate.city === "string" && Array.isArray(candidate.data);
}

export const useDataStore = create<DataState>((set) => ({
  stateData: null,
  cityData: null,
  selectedCity: null,
  loading: false,
  loadingCity: false,

  // Busca os dados do estado
  fetchStateData: async () => {
    set({ loading: true });
    try {
      const data = await fetchJson("api/state");
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Formato inesperado na resposta de /api/state");
      }
      set({ stateData: data, loading: false });
    } catch (error) {
      console.error("Erro ao buscar dados do estado:", error);
      set({ loading: false });
    }
  },

  // Busca os dados da cidade
  fetchCityData: async (city) => {
    set({ loadingCity: true });
    try {
      const data = await fetchJson(`/api/state?city=${city}`);
      if (!isCityData(data)) {
        throw new Error(`Formato inesperado na resposta de /api/state?city=${city}`);
      }
      set({ cityData: [data], loadingCity: false });
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