'use client';

import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo ao DengueMG</h1>
      <p className="home-subtitle">Acompanhe a situação epidemiológica da dengue em Minas Gerais.</p>
      <button className="home-button" type="button" onClick={() => router.push('/dashboard')}>
        Acessar Dashboard
      </button>
    </div>
  );
}