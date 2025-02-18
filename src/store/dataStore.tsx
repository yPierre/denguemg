import { create } from "zustand";

interface DataState {
  stateData: any | null;
  cityData: any | null;
  loading: boolean; // Novo estado de carregamento
  loadingCity: boolean;
  fetchStateData: () => Promise<void>;
  fetchCityData: (city: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  stateData: null,
  cityData: null,
  loading: false, // Inicialize como false
  loadingCity: false,

  // Função para buscar os dados do estado ao carregar a página
  fetchStateData: async () => {
    set({ loading: true }); // Define loading como true ao iniciar a busca
    console.log("Chamando fetchStateData...");
    try {
      const response = await fetch("api/state"); // Substitua pelo seu endpoint
      const data = await response.json();
      console.log("Dados carregados:", data);
      set({ stateData: data, loading: false }); // Define loading como false após carregar os dados
    } catch (error) {
      console.error("Erro ao buscar dados do estado:", error);
      set({ loading: false }); // Define loading como false em caso de erro
    }
  },

  // Função para buscar os dados da cidade quando o usuário clicar
  fetchCityData: async (city) => {
    console.log("Chamando fetchCityData...");
    set({ loadingCity: true });
    try {
      const response = await fetch(`/api/citiesv3?city=${city}`); // Substitua pelo seu endpoint
      const data = await response.json();
      set({ cityData: data, loadingCity: false });
    } catch (error) {
      console.error("Erro ao buscar dados da cidade:", error);
      set({ loadingCity: false });
    }
  },
}));
