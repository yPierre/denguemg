//import BarChart from '@/app/components/barchart';
import BarChart from '@/app/components/barchart2';
import LineChart from '../components/linechart';
import MapChart from '../components/mapchart';

export default function Page() {
  return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-6">Dashboard de Dengue</h1>
          <BarChart />
          <LineChart />
          <MapChart />
      </main>
  );
}