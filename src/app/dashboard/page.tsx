"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import BarChart from "@/app/components/barchart2";
import KPI from "@/app/components/kpis";
import LineChart from "../components/linechart";
import SearchBar from "../components/searchbar";
import Header from "../components/header";


const MapChart = dynamic(() => import("../components/mapchart"), {
  ssr: false, // Desativa a renderização no servidor para este componente
});
export default function Page() {
  const { fetchStateData } = useDataStore();

  useEffect(() => {
    fetchStateData(); // Busca os dados do estado ao carregar a página
  }, [fetchStateData]);

  return (
    <div className="main-container">
      <Header />
      <main className="main">
        <div className="container">
          {/* Sidebar (esquerda) */}
          <aside className="sidebar">
            <KPI />
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
    </div>
  );
}