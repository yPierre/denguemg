"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import BarChart from "@/app/components/barchart2";
import KPI from "@/app/components/kpis";
import LineChart from "../components/linechart";
import SearchBar from "../components/searchbar";

const MapChart = dynamic(() => import("../components/mapchart2"), {
  ssr: false, // Desativa a renderização no servidor para este componente
});
export default function Page() {
  const { fetchStateData } = useDataStore();

  useEffect(() => {
    fetchStateData(); // Busca os dados do estado ao carregar a página
  }, [fetchStateData]);

  return (
    <main className="main-container">
      <header className="header">DengueMG - Dashboard de Dengue</header>
      <div className="container">
        {/* Sidebar (esquerda) */}
        <aside className="sidebar">
          <div className="kpi-container">
            <KPI />
          </div>
          <SearchBar />
          <BarChart />
        </aside>

        {/* Conteúdo principal (direita) */}
        <section className="content">
          <MapChart />
          <LineChart />
        </section>
      </div>
    </main>
  );
}