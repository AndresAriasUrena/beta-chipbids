// src/components/TrendingMarkets.jsx
"use client";

import { useRouter } from 'next/navigation';

const TrendingMarkets = ({ markets = [] }) => {
  const router = useRouter();
  
  // Ordenar mercados por "calor" (suma de actividad reciente y volumen)
  const getTrendingMarkets = () => {
    if (!markets || markets.length === 0) return [];
    
    // Calculamos un "score" de tendencia basado en volumen y número de apuestas
    return [...markets]
      .map(market => {
        const volume = (market.yesPool || 0) + (market.noPool || 0);
        const bets = market.totalBets || 0;
        
        // Fórmula para calcular qué tan "caliente" está un mercado
        // Más peso a las apuestas recientes (simulamos esto con totalBets por ahora)
        const heatScore = volume * 0.6 + bets * 40;
        
        return {
          ...market,
          heatScore,
          // Determinamos visualmente qué tan "caliente" está (para la UI)
          heatLevel: heatScore > 10000 ? 3 : heatScore > 5000 ? 2 : heatScore > 2000 ? 1 : 0
        };
      })
      .sort((a, b) => b.heatScore - a.heatScore)
      .slice(0, 6); // Limitamos a los 6 más calientes
  };
  
  const trendingMarkets = getTrendingMarkets();
  
  if (trendingMarkets.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span>Mercados Calientes</span>
          <span className="ml-2 text-[#ff3366]">🔥</span>
        </h2>
        <button 
          className="text-sm text-[#00e5ff] hover:text-[#00b8cc] transition-colors"
          onClick={() => router.push('/trending')}
        >
          Ver todos
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingMarkets.map(market => (
          <div 
            key={market.id}
            className="bg-[#151515] rounded-lg border border-[#222] p-4 hover:border-[#ff3366] hover:shadow-[0_0_15px_rgba(255,51,102,0.2)] transition-all cursor-pointer relative overflow-hidden"
            onClick={() => router.push(`/markets/${market.id}`)}
          >
            {/* Heat indicator - Se muestra según qué tan caliente está el mercado */}
            {market.heatLevel > 0 && (
              <div className="absolute top-0 right-0 p-1">
                <div className="flex items-center">
                  {market.heatLevel >= 1 && <span className="text-lg">🔥</span>}
                  {market.heatLevel >= 2 && <span className="text-lg">🔥</span>}
                  {market.heatLevel >= 3 && <span className="text-lg">🔥</span>}
                </div>
              </div>
            )}
            
            {/* Aquí podemos agregar el indicador de país si está disponible */}
            {market.country && (
              <div className="inline-block bg-[#181820] rounded px-2 py-1 text-xs text-gray-300 mb-2">
                {getCountryFlag(market.country)} {getCountryName(market.country)}
              </div>
            )}
            
            <h3 className="font-bold text-white truncate mb-2">{market.title}</h3>
            
            <div className="flex justify-between mb-1">
              <span className="text-[#00ff88] text-sm">{calculatePercentage(market.yesPool, market.yesPool + market.noPool)}%</span>
              <span className="text-[#ff3366] text-sm">{calculatePercentage(market.noPool, market.yesPool + market.noPool)}%</span>
            </div>
            
            <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00ff88] float-left"
                style={{ 
                  width: `${calculatePercentage(market.yesPool, market.yesPool + market.noPool)}%` 
                }}
              ></div>
              <div 
                className="h-full bg-[#ff3366] float-right"
                style={{ 
                  width: `${calculatePercentage(market.noPool, market.yesPool + market.noPool)}%` 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{formatTimeRemaining(market.endDate)}</span>
              </div>
              <div className="flex items-center text-xs bg-[#101010] rounded px-1.5 py-0.5">
                <span className="text-[#00e5ff]">{(market.yesPool + market.noPool).toLocaleString()}</span>
                <span className="text-gray-400 ml-1">CHIPS</span>
              </div>
            </div>
            
            {/* Activity indicator */}
            <div className="flex items-center justify-center w-full mt-3">
              <div className="relative w-full h-1 bg-[#101010] rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full ${
                    market.heatLevel >= 3
                      ? 'bg-gradient-to-r from-[#ff3366] via-[#ff3366] to-transparent animate-pulse'
                      : market.heatLevel >= 2
                        ? 'bg-gradient-to-r from-[#ff3366] to-transparent'
                        : 'bg-[#ff3366]'
                  }`}
                  style={{ width: `${Math.min(100, market.heatScore / 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Función auxiliar para calcular porcentajes
const calculatePercentage = (part, total) => {
  if (!total) return 50;
  return Math.round((part / total) * 100);
};

// Función para formatear tiempo restante
const formatTimeRemaining = (dateString) => {
  if (!dateString) return "Fecha pendiente";
  
  const endDate = new Date(dateString);
  const now = new Date();
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "Finalizado";
  if (diffDays === 1) return "1 día restante";
  if (diffDays < 30) return `${diffDays} días restantes`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 mes restante";
  return `${diffMonths} meses restantes`;
};

// Función para obtener la bandera de un país
const getCountryFlag = (countryCode) => {
  const flagMap = {
    'AR': '🇦🇷',
    'BR': '🇧🇷',
    'CL': '🇨🇱',
    'CO': '🇨🇴',
    'CR': '🇨🇷',
    'MX': '🇲🇽',
    'PE': '🇵🇪',
    'US': '🇺🇸',
    'UY': '🇺🇾',
    'VE': '🇻🇪',
  };
  
  return flagMap[countryCode] || '🌎';
};

// Función para obtener el nombre de un país
const getCountryName = (countryCode) => {
  const nameMap = {
    'AR': 'Argentina',
    'BR': 'Brasil',
    'CL': 'Chile',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'MX': 'México',
    'PE': 'Perú',
    'US': 'Estados Unidos',
    'UY': 'Uruguay',
    'VE': 'Venezuela',
  };
  
  return nameMap[countryCode] || 'Global';
};

export default TrendingMarkets;