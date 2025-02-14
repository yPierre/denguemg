import BarChart from "@/app/components/barchart2";
import LineChart from "../components/linechart";
import MapChart from "../components/mapchart";

export default function Page() {
  return (
    <main className="container">
      {/* Sidebar (esquerda) */}
      <aside className="sidebar">
        <div className="kpi-container">KPIs aqui</div>
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
