"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, ChartDataset, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

// Registrar os componentes do Chart.js
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Tipagem dos dados vindos da API
interface CityData {
    city: string;
    codigoIBGE: number;
    data: { SE: number; casos: number | null }[];
}

export default function LineChart() {
    const [cities, setCities] = useState<CityData[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<number>(2023);
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

                setCities(data);
                setSelectedCity(data[0].city); // Define a primeira cidade como padrão
            } catch (error) {
                console.error("Erro ao buscar os dados:", error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedCity) return;

        const city = cities.find(c => c.city === selectedCity);
        if (!city) return;

        // Filtrar os dados apenas do ano selecionado
        let filteredData = city.data.filter(entry => Math.floor(entry.SE / 100) === selectedYear);

        // Ordenar do menor SE para o maior (para ficar na ordem cronológica)
        filteredData = filteredData.sort((a, b) => a.SE - b.SE);

        // Criar os valores do gráfico
        const labels = filteredData.map(entry => entry.SE % 100); // Pega apenas a semana do ano
        const casos = filteredData.map(entry => (entry.casos != null ? entry.casos : 0));

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: `Casos em ${city.city} (${selectedYear})`,
                    data: casos,
                    fill: false,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(75, 192, 192, 1)"
                }
            ]
        });
    }, [selectedCity, selectedYear, cities]);

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold text-center mb-4">Evolução dos Casos</h2>

            {/* Dropdowns de seleção */}
            <div className="flex justify-center gap-4 mb-4">
                <select
                    className="p-2 border rounded-md"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    {cities.map(city => (
                        <option key={city.codigoIBGE} value={city.city}>{city.city}</option>
                    ))}
                </select>

                <select
                    className="p-2 border rounded-md"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                    {[2024, 2023, 2022, 2021, 2020].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Gráfico */}
            <div className="h-[400px] w-full">
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: "Semana Epidemiológica" } },
                            y: { beginAtZero: true, title: { display: true, text: "Casos" } }
                        }
                    }}
                />
            </div>
        </div>
    );
}
