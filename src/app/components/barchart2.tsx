"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, ChartDataset, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

// Registrar componentes do Chart.js
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Tipagem dos dados vindos da API
interface CityData {
    city: string;
    geocode: number;
    casos: number;
    nivel: number;
}

export default function BarChart2() {
    const [chartData, setChartData] = useState<{
        labels: string[];
        datasets: ChartDataset<"bar">[];
    }>({
        labels: [],
        datasets: []
    });

    const [chartTitle, setChartTitle] = useState("Casos de Dengue");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/state");
                const stateData = await response.json();

                if (!stateData || !Array.isArray(stateData.cities)) {
                    console.error("Dados inválidos recebidos:", stateData);
                    return;
                }

                // Capturar os dados de SE (Semana Epidemiológica)
                const latestSE = stateData.cities[0]?.SE || "Desconhecido"; 

                // Atualizar o título do gráfico
                setChartTitle(`Casos de dengue referentes à semana ${latestSE.toString().slice(4)} e ano ${latestSE.toString().slice(0, 4)}`);

                // Ordenar as cidades pelos casos na última semana (descendente)
                const sortedCities = stateData.cities
                    .sort((a: CityData, b: CityData) => b.casos - a.casos)
                    .slice(0, 15); // Pegar apenas as 15 cidades com mais casos

                const labels = sortedCities.map(city => city.city);
                const casos = sortedCities.map(city => city.casos);
                const backgroundColors = sortedCities.map(city => getAlertColor(city.nivel));

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: "Casos na Última Semana",
                            data: casos,
                            backgroundColor: backgroundColors,
                            borderColor: backgroundColors.map(color => color.replace("0.6", "1")),
                            borderWidth: 1
                        }
                    ]
                });
            } catch (error) {
                console.error("Erro ao buscar os dados:", error);
            }
        }

        fetchData();
    }, []);

    // Função para definir cores com base no nível de alerta
    const getAlertColor = (nivel: number) => {
        switch (nivel) {
            case 1: return "rgba(75, 192, 192, 0.6)"; // Verde (baixo risco)
            case 2: return "rgba(255, 206, 86, 0.6)"; // Amarelo (médio risco)
            case 3: return "rgba(255, 159, 64, 0.6)"; // Laranja (alto risco)
            case 4: return "rgba(255, 99, 132, 0.6)"; // Vermelho (alerta máximo)
            default: return "rgba(200, 200, 200, 0.6)"; // Cinza (desconhecido)
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold text-center mb-4">{chartTitle}</h2>
            <div className="chart-container">
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: "y", // Mantém gráfico vertical
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    font: { size: 14 }
                                }
                            },
                            y: {
                                ticks: {
                                    font: { size: 12 },
                                    autoSkip: false // Garante que todos os nomes das cidades apareçam
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: "top"
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}
