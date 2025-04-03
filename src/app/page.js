"use client";  // Esto es importante para componentes que usan hooks

import { useEffect, useState } from 'react';
import Image from "next/image";
import { useWallet } from '../contexts/WalletContext';
import { mockBlockchain } from '../services/mockBlockchain';
import { useRouter } from 'next/navigation';
import PolymarketInspiredHeader from '../components/PolymarketInspiredHeader';
import RegionalFilters from '../components/RegionalFilters';
import TrendingMarkets from '../components/TrendingMarkets';
import MarketImage from '../components/MarketImage';
import { Toaster, toast } from 'react-hot-toast';

import CategoryBanners from '@/components/CategoryBanners';

export const dynamic = 'force-static';

export default function Home() {
  const { publicKey, connected, balance, connect, disconnect, loading } = useWallet();
  const [markets, setMarkets] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const router = useRouter();

  const [stats, setStats] = useState({
    activeMarkets: 0,
    totalWagered: 0,
    activeUsers: 0,
    avgReturns: 0
  });
  
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeCountry, setActiveCountry] = useState(null);
  
  // Definición de regions (importada del componente RegionalFilters)
  const regions = [
    { id: 'all', name: 'Todos' },
    { id: 'north_america', name: 'Norteamérica', countries: ['US', 'CA', 'MX'], flag: '🇺🇸' },
    { id: 'central_america', name: 'Centroamérica', countries: ['GT', 'BZ', 'HN', 'SV', 'NI', 'CR', 'PA'], flag: '🇨🇷' },
    { id: 'south_america', name: 'Sudamérica', countries: ['CO', 'VE', 'EC', 'PE', 'BR', 'BO', 'PY', 'CL', 'AR', 'UY'], flag: '🇧🇷' },
    { id: 'caribbean', name: 'Caribe', countries: ['CU', 'DO', 'PR', 'JM', 'HT'], flag: '🇩🇴' },
    { id: 'europe', name: 'Europa', countries: ['ES', 'GB', 'DE', 'FR', 'IT'], flag: '🇪🇺' }
  ];

  const handleRegionChange = (regionId) => {
    setActiveRegion(regionId);
    // Si cambiamos de región, reseteamos el filtro de país
    if (activeRegion !== regionId) {
      setActiveCountry(null);
    }
  };
  
  const handleCountryChange = (countryId) => {
    setActiveCountry(countryId);
  };
  
  // Función para filtrar mercados por región y país
  const getFilteredMarkets = () => {
    // Primero filtramos por categoría (existente)
    let filtered = activeCategory === 'all' 
      ? markets 
      : markets.filter(market => market.category === activeCategory);
    
    // Luego filtramos por región/país
    if (activeRegion !== 'all') {
      const regionCountries = regions.find(r => r.id === activeRegion)?.countries || [];
      
      // Si hay un país seleccionado, filtramos por ese país
      if (activeCountry) {
        filtered = filtered.filter(market => market.country === activeCountry);
      } 
      // Si no hay país pero sí región, filtramos por todos los países de esa región
      else {
        filtered = filtered.filter(market => 
          !market.country || regionCountries.includes(market.country)
        );
      }
    }
    
    return filtered;
  };
  
  // Obtener los mercados filtrados
  const filteredMarkets = getFilteredMarkets();

  // Cargar mercados
  useEffect(() => {
    const loadMarkets = async () => {
      setLoadingMarkets(true);
      try {
        // Inicializar wallet anónima si es necesario
        if (!connected) {
          await mockBlockchain.initializeAnonymousWallet();
        }
        
        // Inicializar mercados de ejemplo si no hay ninguno
        await mockBlockchain.initializeDefaultMarkets(); 

        // Obtener todos los mercados
        const allMarkets = await mockBlockchain.markets.getAllMarkets();
        setMarkets(allMarkets);
        
        // Calcular estadísticas
        const activeMarkets = allMarkets.filter(m => m.status === 'open').length;
        
        // Calcular total apostado
        const totalWagered = allMarkets.reduce((total, market) => {
          return total + (market.yesPool || 0) + (market.noPool || 0);
        }, 0);
        
        // Recolectar creadores únicos como aproximación a usuarios activos
        const uniqueWallets = new Set();
        allMarkets.forEach(market => {
          uniqueWallets.add(market.creator);
        });
        const activeUsers = Math.max(uniqueWallets.size * 3, 50); // Asumimos que hay más usuarios que creadores
        
        // Rentabilidad media simulada
        const avgReturns = 15 + Math.floor(Math.random() * 15); // Entre 15% y 30%
        
        setStats({
          activeMarkets,
          totalWagered,
          activeUsers,
          avgReturns
        });
      } catch (error) {
        console.error("Error al cargar mercados:", error);
      } finally {
        setLoadingMarkets(false);
      }
    };
    
    loadMarkets();
  }, []);  // Ya no depende de 'connected'

  // Encontrar mercados destacados
  const featuredMarkets = markets.length > 0 
  ? (function() {
      // Crear una copia para ordenar sin modificar el original
      const marketsCopy = [...markets];
      
      // Ordenar por volumen total (suma de apuestas) para encontrar el más popular
      const sortedByVolume = [...marketsCopy].sort((a, b) => 
        (b.yesPool + b.noPool) - (a.yesPool + a.noPool)
      );
      
      // Obtener el mercado más popular
      const mostPopular = sortedByVolume[0];
      
      // Filtrar este mercado para que no aparezca dos veces
      const remainingMarkets = marketsCopy.filter(m => m.id !== mostPopular.id);
      
      // Ordenar los mercados restantes por cercanía a 50/50 para encontrar el más disputado
      const sortedByDispute = [...remainingMarkets].sort((a, b) => {
        const aRatio = a.yesPool / (a.yesPool + a.noPool) || 0.5;
        const bRatio = b.yesPool / (b.yesPool + b.noPool) || 0.5;
        return Math.abs(0.5 - aRatio) - Math.abs(0.5 - bRatio);
      });
      
      // El mercado más disputado (más cercano a 50/50)
      const mostDisputed = sortedByDispute[0] || sortedByVolume[1]; // Fallback al segundo más popular
      
      return [mostPopular, mostDisputed];
    })()
  : [];

    // Función para calcular porcentaje
    const getPercentage = (part, total) => {
      if (!total) return 50;
      return Math.round((part / total) * 100);
    };

    // Manejador de trading rápido
    const [betModal, setBetModal] = useState({
      isOpen: false,
      marketId: null,
      option: null,
      market: null
    });

    const [betAmount, setBetAmount] = useState(10);
    const [betProcessing, setBetProcessing] = useState(false);

    // Abrir modal de apuesta rápida
    const handleQuickTrade = (marketId, option) => {
      if (!connected) {
        // Si el usuario no está conectado, mostrar prompt de conexión
        setShowAuthPrompt(true);
        return;
      }
      
      const market = markets.find(m => m.id === marketId);
      if (market) {
        setBetModal({
          isOpen: true,
          marketId,
          option,
          market
        });
      }
    };

    // Realizar apuesta
    const handlePlaceBet = async () => {
      if (!connected || !betModal.marketId || !betModal.option) {
        return;
      }
      
      setBetProcessing(true);
      try {
        // Realizar la apuesta
        const { market } = await mockBlockchain.bets.placeBet(
          publicKey,
          betModal.marketId,
          betModal.option,
          betAmount
        );
        
        // Actualizar el mercado en el estado
        setMarkets(prevMarkets => 
          prevMarkets.map(m => m.id === market.id ? market : m)
        );
        
        // Cerrar modal
        setBetModal({ isOpen: false, marketId: null, option: null, market: null });
        
        // Mostrar mensaje de éxito
        toast.success(`Apuesta de ${betAmount} CHIPS a "${betModal.option === 'yes' ? 'Sí' : 'No'}" realizada con éxito!`);
        
        // Actualizar balance
        await updateBalance();
      } catch (error) {
        console.error("Error al realizar apuesta:", error);
        toast.error(error.message || "Error al realizar la apuesta");
      } finally {
        setBetProcessing(false);
      }
    };

    // Modal de autenticación
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{
      backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#151515',
          color: '#ffffff',
          border: '1px solid #222'
        },
        success: {
          iconTheme: {
            primary: '#00ff88',
            secondary: '#000'
          }
        },
        error: {
          iconTheme: {
            primary: '#ff3366',
            secondary: '#000'
          }
        }
      }} />
      
      {/* Nuevo header inspirado en Polymarket */}
      <PolymarketInspiredHeader 
        connected={connected}
        publicKey={publicKey}
        balance={balance}
        connect={connect}
        disconnect={disconnect}
        loading={loading}
      />

      <main className="container mx-auto px-4 pt-6">

        <CategoryBanners/>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#151515] border border-[#222] rounded-lg p-4 hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            <p className="text-gray-400 text-sm">Mercados Activos</p>
            <p className="text-2xl font-bold text-[#00e5ff]">{stats.activeMarkets}</p>
          </div>
          <div className="bg-[#151515] border border-[#222] rounded-lg p-4 hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            <p className="text-gray-400 text-sm">Total Apostado</p>
            <p className="text-2xl font-bold text-[#00e5ff]">{stats.totalWagered.toLocaleString()} CHIPS</p>
          </div>
          <div className="bg-[#151515] border border-[#222] rounded-lg p-4 hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            <p className="text-gray-400 text-sm">Usuarios Activos</p>
            <p className="text-2xl font-bold text-[#00e5ff]">{stats.activeUsers}</p>
          </div>
          <div className="bg-[#151515] border border-[#222] rounded-lg p-4 hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            <p className="text-gray-400 text-sm">Rentabilidad Media</p>
            <p className="text-2xl font-bold text-[#00e5ff]">+{stats.avgReturns}%</p>
          </div>
        </div>
        
        {/* Mercados Destacados */}
        {featuredMarkets.length >= 2 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center">
              Mercados Destacados 
              <span className="ml-2 text-[#00ff88]">⭐</span>
            </h3>
            <div className="bg-gradient-to-r from-[#11151a] to-[#0a0a0a] p-5 rounded-xl border border-[#222]">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-[#151515] rounded-lg overflow-hidden border border-[#222] hover:border-[#00e5ff] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all cursor-pointer" onClick={() => router.push(`/markets/${featuredMarkets[0].id}`)}>
                  {/* Imagen del mercado destacado 1 */}
                  <div className="relative">
                    <MarketImage market={featuredMarkets[0]} height={180} />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#102030] text-[#00e5ff] text-xs font-semibold px-2.5 py-0.5 rounded-full">Popular</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-2">{featuredMarkets[0].title}</h4>
                    <div className="w-full bg-[#0a0a0a] h-2 mb-3 rounded-full">
                      <div className="bg-[#00e5ff] h-2 rounded-full" style={{ 
                        width: `${featuredMarkets[0].yesPool / (featuredMarkets[0].yesPool + featuredMarkets[0].noPool) * 100}%` 
                      }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{(featuredMarkets[0].yesPool + featuredMarkets[0].noPool).toLocaleString()} CHIPS apostados</span>
                      <span className="font-medium text-[#00e5ff]">Ver mercado →</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-[#151515] rounded-lg overflow-hidden border border-[#222] hover:border-[#ff3366] hover:shadow-[0_0_15px_rgba(255,51,102,0.2)] transition-all cursor-pointer" onClick={() => router.push(`/markets/${featuredMarkets[1].id}`)}>
                  {/* Imagen del mercado destacado 2 */}
                  <div className="relative">
                    <MarketImage market={featuredMarkets[1]} height={180} />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#301020] text-[#ff3366] text-xs font-semibold px-2.5 py-0.5 rounded-full">Tendencia</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-2">{featuredMarkets[1].title}</h4>
                    <div className="w-full bg-[#0a0a0a] h-2 mb-3 rounded-full">
                      <div className="bg-[#ff3366] h-2 rounded-full" style={{ 
                        width: `${featuredMarkets[1].yesPool / (featuredMarkets[1].yesPool + featuredMarkets[1].noPool) * 100}%` 
                      }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{(featuredMarkets[1].yesPool + featuredMarkets[1].noPool).toLocaleString()} CHIPS apostados</span>
                      <span className="font-medium text-[#ff3366]">Ver mercado →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Filtros Regionales */}
        <RegionalFilters 
          onRegionChange={handleRegionChange}
          onCountryChange={handleCountryChange}
          activeRegion={activeRegion}
          activeCountry={activeCountry}
        />

        {/* Mercados Calientes */}
        <TrendingMarkets markets={markets} />

        {/* Lista de Mercados */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Mercados Predictivos</h2>
            <button
              className="bg-[#00ff88] hover:bg-[#00cc6f] text-black font-bold py-2 px-6 rounded-full shadow transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.5)]"
              onClick={() => router.push('/markets/create')}
            >
              + Crear Mercado
            </button>
          </div>
          
          {loadingMarkets ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-t-2 border-b-2 border-[#00e5ff] rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Cargando mercados...</span>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="bg-[#151515] p-8 text-center rounded-lg border border-[#222]">
              <p className="text-gray-400 mb-4">No hay mercados disponibles en esta categoría.</p>
              <button 
                className="bg-[#00e5ff] hover:bg-[#00b8cc] text-black font-bold py-2 px-4 rounded-md transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                onClick={() => router.push('/markets/create')}
              >
                Crear Nuevo Mercado
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map(market => (
                <div key={market.id} className="bg-[#151515] border border-[#222] rounded-lg overflow-hidden hover:border-[#00e5ff] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all">
                  {/* Imagen del mercado */}
                  <div className="relative">
                    <MarketImage market={market} height={160} />
                    
                    <div className="absolute bottom-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        market.status === 'open' 
                          ? 'bg-[#102010] text-[#00ff88]' 
                          : market.status === 'resolved'
                            ? 'bg-[#102030] text-[#00e5ff]' 
                            : 'bg-[#101010] text-gray-400'
                      }`}>
                        {market.status === 'open' 
                          ? 'Abierto' 
                          : market.status === 'resolved'
                            ? 'Resuelto'
                            : 'Cerrado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold truncate text-white pr-2 mb-2">{market.title}</h3>
                    
                    <p className="text-gray-400 mb-3 h-10 overflow-hidden text-sm">{market.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-[#00ff88] font-medium">{getPercentage(market.yesPool, market.yesPool + market.noPool)}%</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          {(market.yesPool + market.noPool).toLocaleString()} CHIPS
                        </div>
                        <div className="text-sm">
                          <span className="text-[#ff3366] font-medium">{getPercentage(market.noPool, market.yesPool + market.noPool)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden mt-1">
                        {(market.yesPool || market.noPool) ? (
                          <>
                            <div 
                              className={`h-full bg-[#00ff88] float-left ${market.resolvedOption === 'yes' ? 'animate-pulse' : ''}`}
                              style={{ 
                                width: `${getPercentage(market.yesPool, market.yesPool + market.noPool)}%` 
                              }}
                            ></div>
                            <div 
                              className={`h-full bg-[#ff3366] float-right ${market.resolvedOption === 'no' ? 'animate-pulse' : ''}`}
                              style={{ 
                                width: `${getPercentage(market.noPool, market.yesPool + market.noPool)}%` 
                              }}
                            ></div>
                          </>
                        ) : (
                          <div className="h-full bg-[#222] w-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400 mb-3">
                      <span>
                        Cierra: {new Date(market.endDate || market.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Vol: {(market.yesPool + market.noPool).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Trading buttons */}
                    <div className="flex space-x-2 mb-3">
                      {market.status === 'open' ? (
                        <>
                          <button 
                            onClick={() => handleQuickTrade(market.id, 'yes')}
                            className="w-1/2 py-2 bg-[#102010] hover:bg-[#00ff88] text-[#00ff88] hover:text-black font-medium rounded transition-all flex justify-center items-center text-sm hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                          >
                            Comprar Sí <span className="ml-1">↗</span>
                          </button>
                          <button 
                            onClick={() => handleQuickTrade(market.id, 'no')}
                            className="w-1/2 py-2 bg-[#200a10] hover:bg-[#ff3366] text-[#ff3366] hover:text-white font-medium rounded transition-all flex justify-center items-center text-sm hover:shadow-[0_0_10px_rgba(255,51,102,0.3)]"
                          >
                            Comprar No <span className="ml-1">↗</span>
                          </button>
                        </>
                      ) : market.status === 'resolved' ? (
                        <div className="w-full py-2 bg-[#102030] text-[#00e5ff] font-medium rounded flex justify-center items-center text-sm">
                          <span>Resuelto: {market.resolvedOption === 'yes' ? 'SÍ' : 'NO'}</span>
                        </div>
                      ) : (
                        <div className="w-full py-2 bg-[#101010] text-gray-400 font-medium rounded flex justify-center items-center text-sm">
                          <span>Mercado cerrado</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="w-full bg-[#101010] hover:bg-[#1a1a1a] text-gray-300 border border-[#222] font-medium py-2 px-4 rounded-md transition-all text-sm"
                      onClick={() => router.push(`/markets/${market.id}`)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minijuegos destacados con videos */}
        <div className="mt-12 bg-gradient-to-r from-[#101021] to-[#101016] rounded-lg p-6 border border-[#222]">
          <h3 className="text-xl font-bold mb-4 text-[#00e5ff] flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Minijuegos
            <span className="ml-2 text-xs bg-[#00ff88] text-black px-2 py-0.5 rounded-full">Próximamente</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#151515] rounded-lg p-4 border border-[#222] hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <div className="relative h-32 rounded bg-[#0a0a0a] mb-3 overflow-hidden">
                {/* Video de Plinko */}
                <video 
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/videos/plinko.mp4" type="video/mp4" />
                  Tu navegador no soporta el tag de video.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-50"></div>
              </div>
              <h4 className="text-lg font-semibold mb-1 text-white">PLINKO</h4>
              <p className="text-gray-400 text-sm">Hasta 1000x multiplicador con caída de bolas</p>
            </div>
            
            <div className="bg-[#151515] rounded-lg p-4 border border-[#222] hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <div className="relative h-32 rounded bg-[#0a0a0a] mb-3 overflow-hidden">
                {/* Video de Dice */}
                <video 
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/videos/dice.mp4" type="video/mp4" />
                  Tu navegador no soporta el tag de video.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-50"></div>
              </div>
              <h4 className="text-lg font-semibold mb-1 text-white">DICE</h4>
              <p className="text-gray-400 text-sm">Predice si el dado caerá por encima o por debajo</p>
            </div>
            
            <div className="bg-[#151515] rounded-lg p-4 border border-[#222] hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <div className="relative h-32 rounded bg-[#0a0a0a] mb-3 overflow-hidden">
                {/* Video de Mines */}
                <video 
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/videos/mines.mp4" type="video/mp4" />
                  Tu navegador no soporta el tag de video.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-50"></div>
              </div>
              <h4 className="text-lg font-semibold mb-1 text-white">MINES</h4>
              <p className="text-gray-400 text-sm">Encuentra las gemas y evita las minas</p>
            </div>
            
            <div className="bg-[#151515] rounded-lg p-4 border border-[#222] hover:border-[#00e5ff] transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <div className="relative h-32 rounded bg-[#0a0a0a] mb-3 overflow-hidden">
                {/* Video de Crash */}
                <video 
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/videos/cases.mp4" type="video/mp4" />
                  Tu navegador no soporta el tag de video.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-50"></div>
              </div>
              <h4 className="text-lg font-semibold mb-1 text-white">CASES</h4>
              <p className="text-gray-400 text-sm">Puedes elegir el indicado?</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="bg-[#00e5ff] hover:bg-[#00b8cc] text-black font-bold py-2 px-6 rounded-full shadow transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]">
              Ver todos los juegos
            </button>
          </div>
        </div>

        {/* Próximamente - Otras características */}
        <div className="mt-12 bg-gradient-to-r from-[#101021] to-[#101016] rounded-lg p-6 border border-[#222]">
          <h3 className="text-xl font-bold mb-4 text-[#00e5ff]">Próximamente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#151515] rounded-lg p-5 border border-[#222] hover:border-[#9945FF] transition-all">
              <div className="bg-[#1a1530] text-[#9945FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-[#9945FF]">Mercados Tokenizados</h4>
              <p className="text-gray-400">Podrás crear y comerciar con tokens representativos de posiciones en un mercado.</p>
              <div className="mt-4">
                <span className="inline-block bg-[#15102a] text-[#9945FF] text-xs px-2 py-1 rounded-full">Pronto</span>
              </div>
            </div>
            
            <div className="bg-[#151515] rounded-lg p-5 border border-[#222] hover:border-[#00e5ff] transition-all">
              <div className="bg-[#102030] text-[#00e5ff] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-[#00e5ff]">Mercados con Recompensas</h4>
              <p className="text-gray-400">Gana CHIPS adicionales por crear mercados populares y acertar en tus predicciones.</p>
              <div className="mt-4">
                <span className="inline-block bg-[#102030] text-[#00e5ff] text-xs px-2 py-1 rounded-full">Fase Beta</span>
              </div>
            </div>
            
            <div className="bg-[#151515] rounded-lg p-5 border border-[#222] hover:border-[#00ff88] transition-all">
              <div className="bg-[#102010] text-[#00ff88] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-[#00ff88]">Sistema de Gamificación</h4>
              <p className="text-gray-400">Compite con otros usuarios, sube de nivel y desbloquea recompensas exclusivas.</p>
              <div className="mt-4">
                <span className="inline-block bg-[#102010] text-[#00ff88] text-xs px-2 py-1 rounded-full">En desarrollo</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-[#222]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">ChipBids</h4>
              <p className="text-gray-400 mb-4">La plataforma descentralizada de mercados predictivos en Solana.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-[#00e5ff] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-[#00e5ff] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-[#00e5ff] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Mercados populares</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Cómo funciona</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Términos de servicio</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Política de cookies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#00e5ff] transition-colors">Acuerdo de usuario</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#222] pt-6 pb-4 text-center text-sm text-gray-500">
            <p>© 2025 ChipBids. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      
      {/* Modal de apuesta rápida */}
      {betModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#222] animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Comprar {betModal.option === 'yes' ? 'Sí' : 'No'}
              </h3>
              <button 
                onClick={() => setBetModal({isOpen: false, marketId: null, option: null, market: null})}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-[#101010] p-3 rounded mb-4 border border-[#222]">
              <p className="text-sm text-gray-400 mb-1">Mercado:</p>
              <p className="font-medium text-white">{betModal.market?.title}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Monto de la Apuesta (CHIPS)
              </label>
              <div className="flex items-center">
                <input
                  className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded-l w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                  type="number"
                  min="1"
                  step="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                />
                <div className="bg-[#151520] text-gray-400 py-2 px-4 rounded-r border-t border-r border-b border-[#222]">
                  CHIPS
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <button onClick={() => setBetAmount(10)} className="hover:text-[#00e5ff]">10</button>
                <button onClick={() => setBetAmount(50)} className="hover:text-[#00e5ff]">50</button>
                <button onClick={() => setBetAmount(100)} className="hover:text-[#00e5ff]">100</button>
                <button onClick={() => setBetAmount(250)} className="hover:text-[#00e5ff]">250</button>
                <button onClick={() => setBetAmount(balance)} className="hover:text-[#00e5ff]">MAX</button>
              </div>
            </div>
            
            <div className="bg-[#101010] p-3 rounded mb-4 border border-[#222]">
              <div className="flex justify-between mb-1">
                <p className="text-sm text-gray-400">Probabilidad actual:</p>
                <span className={`text-sm font-medium ${betModal.option === 'yes' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {betModal.option === 'yes' 
                    ? getPercentage(betModal.market?.yesPool, betModal.market?.yesPool + betModal.market?.noPool) 
                    : getPercentage(betModal.market?.noPool, betModal.market?.yesPool + betModal.market?.noPool)}%
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <p className="text-sm text-gray-400">Tu saldo:</p>
                <span className="text-sm font-medium text-white">{balance} CHIPS</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 font-bold py-2 px-4 rounded transition-all"
                onClick={() => setBetModal({isOpen: false, marketId: null, option: null, market: null})}
              >
                Cancelar
              </button>
              <button 
                className={`flex-1 font-bold py-2 px-4 rounded transition-all ${
                  betModal.option === 'yes' 
                    ? 'bg-[#00ff88] hover:bg-[#00cc6f] text-black' 
                    : 'bg-[#ff3366] hover:bg-[#cc2952] text-white'
                }`}
                onClick={handlePlaceBet}
                disabled={betProcessing || betAmount <= 0 || betAmount > balance}
              >
                {betProcessing 
                  ? 'Procesando...' 
                  : `Confirmar apuesta ${betAmount} CHIPS`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de autenticación */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#222] animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="bg-[#00e5ff] rounded-full p-2 text-black mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Conecta tu wallet para tradear</h3>
            </div>
            <p className="mb-6 text-gray-300">Para realizar una apuesta, necesitas conectar tu wallet primero.</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-[#222] rounded-md text-gray-300 hover:bg-[#222] transition-colors"
                onClick={() => setShowAuthPrompt(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-[#00e5ff] text-black rounded-md hover:bg-[#00b8cc] transition-colors"
                onClick={() => {
                  setShowAuthPrompt(false);
                  connect();
                }}
              >
                Conectar Wallet
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }