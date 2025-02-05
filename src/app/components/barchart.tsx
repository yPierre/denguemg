"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar os componentes necessários do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart: React.FC = () => {
  // Dados do gráfico
  const data = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"], // Labels do eixo X
    datasets: [
      {
        label: "Casos de Dengue",
        data: [50, 75, 150, 100, 200], // Dados do eixo Y
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Cor das barras
        borderColor: "rgba(75, 192, 192, 1)", // Cor da borda
        borderWidth: 1, // Espessura da borda
      },
    ],
  };

  // Configurações adicionais (opcional)
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Casos de Dengue por Mês",
      },
    },
  };

  return (
    <div style={{ width: "60%", margin: "0 auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;