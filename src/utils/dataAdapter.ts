import { CityData, StateData, CityWeekData } from '../store/dataStore'; // Ajuste o caminho

/**
 * Adapta os dados da nova estrutura (statev2) para a estrutura antiga (CityData).
 * @param cityName Nome da cidade.
 * @param stateData Dados da coleção statev2.
 * @returns Dados no formato CityData.
 */
export function adaptCityData(cityName: string, stateData: StateData[]): CityData {
  // Filtra e transforma os dados
  const adaptedData: CityData = {
    city: cityName,
    geocode: 0, // Será preenchido abaixo
    data: []
  };

  stateData.forEach(week => {
    const cityInWeek: CityWeekData | undefined = week.cities.find(c => c.city === cityName);
    if (cityInWeek) {
      // Preenche o geocode na primeira iteração
      if (adaptedData.geocode === 0) {
        adaptedData.geocode = cityInWeek.geocode;
      }

      // Adiciona os dados da semana
      adaptedData.data.push({
        SE: week.SE,
        casos: cityInWeek.casos,
        p_rt1: cityInWeek.p_rt1,
        p_inc100k: cityInWeek.p_inc100k,
        nivel: cityInWeek.nivel,
        nivel_inc: cityInWeek.nivel_inc,
        Rt: cityInWeek.Rt,
        pop: cityInWeek.pop,
        tempmin: cityInWeek.tempmin,
        tempmed: cityInWeek.tempmed,
        tempmax: cityInWeek.tempmax,
        umidmin: cityInWeek.umidmin,
        umidmed: cityInWeek.umidmed,
        umidmax: cityInWeek.umidmax,
        receptivo: cityInWeek.receptivo,
        transmissao: cityInWeek.transmissao,
        notif_accum_year: cityInWeek.notif_accum_year
      });
    }
  });

  return adaptedData;
}