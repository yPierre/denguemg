"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, ChartDataset, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

// Registrar componentes do Chart.js
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Tipagem dos dados vindos da API
interface CityData {
    cidade: string;
    casos: number;
    dados: {casos: number;}
}

export default function BarChart() {
    const [chartData, setChartData] = useState<{
            labels: string[];
            datasets: ChartDataset<"bar">[];
    }>({
            labels: [],
            datasets: []
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/cities");
                const data: CityData[] = await response.json();

                if (!Array.isArray(data)) {
                    console.error("Os dados recebidos não são um array:", data);
                    return;
                }

                // Extrai os nomes das cidades e os casos da posição 0
                const labels = data.map(city => city.cidade);
                const casos = data.map(city => {
                    if (Array.isArray(city.dados) && city.dados.length > 0) {
                        return city.dados[0]?.casos || 0; // Pega a posição 0 de `casos` dentro do primeiro item de `dados`
                    }
                    return 0; // Se `dados` estiver vazio, assume 0 casos
                });

                // Atualiza o estado com novos dados
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: "Casos na 1ª semana",
                            data: casos,
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1
                        }
                    ]
                });
            } catch (error) {
                console.error("Erro ao buscar os dados:", error);
            }
        }

        fetchData();
    }, []); // ✅ O `useEffect` roda apenas uma vez ao montar o componente

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold text-center mb-4">Casos por Cidade</h2>
            <div className="h-[400px] w-full">
                <Bar
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
