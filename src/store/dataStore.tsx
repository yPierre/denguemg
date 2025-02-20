import { create } from "zustand";

interface DataState {
  stateData: any | null;
  cityData: any | null;
  selectedCity: string | null;
  loading: boolean;
  loadingCity: boolean;
  fetchStateData: () => Promise<void>;
  fetchCityData: (city: string) => Promise<void>;
  setSelectedCity: (city: string | null) => void;
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
    try {
      const response = await fetch(`/api/citiesv3?city=${city}`);
      const data = await response.json();
      console.log("Dados da cidade carregados:", data); // Verifique se os dados estão chegando
      set({ cityData: data, loadingCity: false });
    } catch (error) {
      console.error("Erro ao buscar dados da cidade:", error);
      set({ loadingCity: false });
    }
  },

  // Define a cidade selecionada
  setSelectedCity: (city) => {
    console.log("Cidade selecionada(dataStore):", city);
    set({ selectedCity: city });
    if (city) {
      useDataStore.getState().fetchCityData(city); // Busca os dados da cidade
    } else {
      set({ cityData: null }); // Limpa os dados da cidade
    }
  },
}));