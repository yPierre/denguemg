"use client";

import React, { useState } from "react";
import { useDataStore } from "@/store/dataStore"; // Importa o estado global

const SearchBar: React.FC = () => {
  const { setSelectedCity, stateData } = useDataStore(); // Pega o stateData e a função para definir a cidade selecionada
  const [query, setQuery] = useState(""); // Estado para o texto digitado
  const [suggestions, setSuggestions] = useState<string[]>([]); // Estado para as sugestões de cidades

  // Extrai a lista de cidades do stateData
  const cityList = stateData?.[0]?.cities?.map((city: any) => city.city) || [];

  // Função para lidar com a mudança no campo de busca
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Filtra as cidades que correspondem à busca
    if (value.length > 2 && cityList.length > 0) {
      const filteredCities = cityList.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredCities);
    } else {
      setSuggestions([]);
    }
  };

  // Função para lidar com a seleção de uma cidade
  const handleSelectCity = (city: string) => {
    setQuery(city);
    setSuggestions([]);
    setSelectedCity(city); // Atualiza a cidade selecionada no estado global
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Buscar cidade..."
        value={query}
        onChange={handleInputChange}
        className="search-bar"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((city, index) => (
            <li
              key={index}
              onClick={() => handleSelectCity(city)}
              className="suggestion-item"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;