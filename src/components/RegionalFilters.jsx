// src/components/RegionalFilters.jsx
"use client";

import { useState } from 'react';

const regions = [
  { id: 'all', name: 'Todos' },
  { id: 'north_america', name: 'Norteamérica', countries: ['US', 'CA', 'MX'], flag: '🇺🇸' },
  { id: 'central_america', name: 'Centroamérica', countries: ['GT', 'BZ', 'HN', 'SV', 'NI', 'CR', 'PA'], flag: '🇨🇷' },
  { id: 'south_america', name: 'Sudamérica', countries: ['CO', 'VE', 'EC', 'PE', 'BR', 'BO', 'PY', 'CL', 'AR', 'UY'], flag: '🇧🇷' },
  { id: 'caribbean', name: 'Caribe', countries: ['CU', 'DO', 'PR', 'JM', 'HT'], flag: '🇩🇴' },
  { id: 'europe', name: 'Europa', countries: ['ES', 'GB', 'DE', 'FR', 'IT'], flag: '🇪🇺' }
];

const countries = [
  { id: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { id: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { id: 'CL', name: 'Chile', flag: '🇨🇱' },
  { id: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { id: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { id: 'MX', name: 'México', flag: '🇲🇽' },
  { id: 'PE', name: 'Perú', flag: '🇵🇪' },
  { id: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { id: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { id: 'VE', name: 'Venezuela', flag: '🇻🇪' },
];

const RegionalFilters = ({ onRegionChange, onCountryChange, activeRegion = 'all', activeCountry = null }) => {
  const [showCountries, setShowCountries] = useState(false);
  
  // Obtener países correspondientes a la región seleccionada
  const getRegionCountries = () => {
    if (activeRegion === 'all') return countries;
    const region = regions.find(r => r.id === activeRegion);
    if (!region) return [];
    return countries.filter(country => region.countries.includes(country.id));
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Filtrar por Región</h2>
        <button 
          onClick={() => setShowCountries(!showCountries)}
          className="text-sm text-[#00e5ff] hover:text-[#00b8cc] flex items-center gap-1 transition-colors"
        >
          {showCountries ? (
            <>
              <span>Ocultar países</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </>
          ) : (
            <>
              <span>Mostrar países</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </>
          )}
        </button>
      </div>
      
      {/* Filtro por regiones */}
      <div className="flex flex-wrap gap-2 mb-4">
        {regions.map(region => (
          <button
            key={region.id}
            onClick={() => {
              onRegionChange(region.id);
              onCountryChange(null);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeRegion === region.id
                ? 'bg-[#00e5ff] text-black'
                : 'bg-[#151515] border border-[#222] hover:bg-[#1a1a1a] text-gray-200'
            }`}
          >
            {region.id !== 'all' && <span>{region.flag}</span>}
            <span>{region.name}</span>
            {activeRegion === region.id && region.id !== 'all' && (
              <span className="bg-black bg-opacity-20 text-xs rounded-full h-5 px-1.5 flex items-center justify-center">
                {region.countries.length}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Filtro por países (desplegable) */}
      {showCountries && (
        <div className="bg-[#101015] border border-[#222] rounded-lg p-4 mb-4 animate-fadeIn">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Países</h3>
          <div className="flex flex-wrap gap-2">
            {getRegionCountries().map(country => (
              <button
                key={country.id}
                onClick={() => onCountryChange(country.id === activeCountry ? null : country.id)}
                className={`px-2 py-1 rounded text-sm transition-all flex items-center gap-1 ${
                  activeCountry === country.id
                    ? 'bg-[#00e5ff] text-black'
                    : 'bg-[#151515] border border-[#222] hover:bg-[#1a1a1a] text-gray-200'
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalFilters;