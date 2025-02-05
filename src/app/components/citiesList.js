"use client";
import { useEffect, useState } from "react";

export default function CitiesList() {
    const [cities, setCities] = useState([]);

    useEffect(() => {
        async function fetchCities() {
            const response = await fetch("/api/cities");
            const data = await response.json();
            setCities(data);
        }

        fetchCities();
    }, []);

    return (
        <div>
            <h2>Cidades no Banco de Dados</h2>
            <ul>
                {cities.map((city) => (
                    <li key={city.codigoIBGE}>{city.cidade} - {city.codigoIBGE}</li>
                ))}
            </ul>
        </div>
    );
}
