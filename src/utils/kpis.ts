import type { CityData, StateData } from "@/store/dataStore";

export interface KpiSummary {
  cases: number;
  last30DaysCases: number;
  yearlyCases: number;
  se: number;
}

/**
 * Calcula os indicadores exibidos no painel.
 * A cidade tem prioridade sobre o estado, como no comportamento original.
 */
export function computeKpis(
  cityData: CityData[] | null,
  stateData: StateData[] | null
): KpiSummary | null {
  if (cityData && cityData[0]) {
    const sortedCityHistory = [...cityData[0].data].sort((a, b) => b.SE - a.SE);
    const latestCityData = sortedCityHistory[0];
    const se = latestCityData.SE;

    return {
      se,
      cases: latestCityData.casos,
      last30DaysCases: sortedCityHistory
        .slice(0, 4)
        .reduce((total, item) => total + item.casos, 0),
      yearlyCases: sortedCityHistory
        .filter((item) => item.SE.toString().startsWith(se.toString().slice(0, 4)))
        .reduce((total, item) => total + item.casos, 0),
    };
  }

  if (stateData && stateData[0]) {
    const latestStateData = stateData[0];
    const se = latestStateData.SE;

    const uniqueStateData = stateData.filter(
      (item, index, self) => self.findIndex((i) => i.SE === item.SE) === index
    );
    const sortedHistoricalData = [...uniqueStateData].sort((a, b) => b.SE - a.SE);
    const last4Weeks = sortedHistoricalData.slice(0, 4); // Pega as 4 semanas mais recentes

    return {
      se,
      cases: latestStateData.total_week_cases,
      last30DaysCases: last4Weeks.reduce((total, item) => total + item.total_week_cases, 0),
      yearlyCases: uniqueStateData
        .filter((item) => item.SE.toString().startsWith(se.toString().slice(0, 4)))
        .reduce((total, item) => total + item.total_week_cases, 0),
    };
  }

  return null;
}

// Calcular a data a partir de SE
export const getDateFromSE = (se: number) => {
  const seStr = se.toString().padStart(6, "0");
  const year = parseInt(seStr.substring(0, 4));
  const week = parseInt(seStr.substring(4, 6));
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOfWeek = firstDayOfYear.getDay() - 1;
  const firstMondayOffset = (8 - dayOfWeek) % 7 || 7;
  const firstMonday = new Date(firstDayOfYear);
  firstMonday.setDate(firstDayOfYear.getDate() + firstMondayOffset - 1);
  const seMonday = new Date(firstMonday);
  seMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
  const day = String(seMonday.getDate()).padStart(2, "0");
  const month = String(seMonday.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${seMonday.getFullYear()}`;
};
