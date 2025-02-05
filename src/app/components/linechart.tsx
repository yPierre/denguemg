"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, ChartDataset, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

// Registrar os componentes do Chart.js
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Tipagem dos dados vindos da API
interface CityData {
    cidade: string;
    codigoIBGE: number;
    dados: { SE: number; casos: number | null }[]; // `casos` pode ser null
}

export default function LineChart() {
    const [chartData, setChartData] = useState<{
        labels: number[];
        datasets: ChartDataset<"line">[];
    }>({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/cities");
                const data: CityData[] = await response.json();

                if (!Array.isArray(data) || data.length === 0) {
                    console.error("Dados inválidos ou lista vazia:", data);
                    return;
                }

                // Pegar apenas a primeira cidade da lista
                const city = data[3];

                // Criar os valores do gráfico percorrendo `dados`
                const labels = city.dados.map(entry => entry.SE); // Número da Semana Epidemiológica
                const casos = city.dados.map(entry => (entry.casos != null ? entry.casos : 0)); // Substitui null por 0

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: `Casos em ${city.cidade}`,
                            data: casos,
                            fill: false,
                            borderColor: "rgba(75, 192, 192, 1)",
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            pointRadius: 5,
                            pointBackgroundColor: "rgba(75, 192, 192, 1)"
                        }
                    ]
                });
            } catch (error) {
                console.error("Erro ao buscar os dados:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold text-center mb-4">Evolução dos Casos</h2>
            <div className="h-[400px] w-full">
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }}
                />
            </div>
        </div>
    );
}
