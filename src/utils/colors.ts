/**
 * Escalas de cores compartilhadas entre o mapa e o gráfico de barras.
 * As escalas de casos absolutos são específicas de cada visualização
 * (mapa usa faixas por semana; barras usam faixas de ranking) e
 * permanecem nos respectivos componentes.
 */

export function getColorByNivel(nivel: number): string {
  switch (nivel) {
    case 1: return "#4daf4a";
    case 2: return "#ffff33";
    case 3: return "#ff7f00";
    case 4: return "#e41a1c";
    default: return "#C8C8C8";
  }
}

export function getColorByNivelColorblind(nivel: number): string {
  switch (nivel) {
    case 1: return "#0077bb"; // Azul escuro
    case 2: return "#33bbee"; // Azul médio
    case 3: return "#ee7733"; // Laranja claro
    case 4: return "#cc3311"; // Vermelho escuro
    default: return "#bbbbbb"; // Desconhecido
  }
}

export function getColorByIncidencia(incidencia: number): string {
  if (incidencia >= 300) return "#bd0026"; // Vinho
  if (incidencia >= 200) return "#f03b20"; // Vermelho
  if (incidencia >= 100) return "#fd8d3c"; // Laranja escuro
  if (incidencia >= 50) return "#feb24c"; // Laranja claro
  if (incidencia >= 10) return "#fed976"; // Amarelo escuro
  if (incidencia >= 0) return "#ffffb2"; // Amarelo claro
  return "#C8C8C8";
}
