"use client";

import { useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import BarChart from "@/app/components/barchart2";
import KPI from "@/app/components/kpis";
import MapChart from "../components/mapchart2";
import LineChart from "../components/linechart";

export default function Page() {
  const { fetchStateData } = useDataStore();

  useEffect(() => {
    fetchStateData(); // Busca os dados do estado ao carregar a página
  }, [fetchStateData]);

  return (
    <main className="container">
      {/* Sidebar (esquerda) */}
      <aside className="sidebar">
        <div className="kpi-container">
          <KPI/>
        </div>
        <input type="text" placeholder="Buscar cidade..." className="search-bar" />
        <BarChart />
      </aside>

      {/* Conteúdo principal (direita) */}
      <section className="content">
        <MapChart />
        <LineChart />
      </section>
    </main>
  );
}
