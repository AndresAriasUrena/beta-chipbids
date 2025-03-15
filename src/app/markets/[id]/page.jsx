// src/app/markets/[id]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '../../../contexts/WalletContext';
import { mockBlockchain } from '../../../services/mockBlockchain';
import Link from 'next/link';
import ProbabilityChart from '../../../components/ProbabilityChart';
import MarketSummaryAI from '../../../components/MarketSummaryAI';
import ResolveMarketModal from '../../../components/ResolveMarketModal';
import MarketImage from '../../../components/MarketImage';

export default function MarketDetail() {
  const router = useRouter();
  const { id } = useParams();
  const { publicKey, connected, balance, connect } = useWallet();
  
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [betOption, setBetOption] = useState('yes');
  const [betAmount, setBetAmount] = useState(10);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');
  
  // Para componentes desplegables
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Para el gráfico de evolución
  const [chartPeriod, setChartPeriod] = useState('all');
  
  // Para la resolución de mercados
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Simulación de rol de administrador

  useEffect(() => {
    const loadMarket = async () => {
      setLoading(true);
      try {
        // Obtener los mercados (simulado)
        const markets = await mockBlockchain.markets.getAllMarkets();
        const foundMarket = markets.find(m => m.id === id);
        
        if (foundMarket) {
          setMarket(foundMarket);
          
          // Simulamos que somos administradores si estamos conectados
          // En un caso real, esto verificaría los permisos del usuario
          if (connected) {
            setIsAdmin(true);
          }
        } else {
          // Mercado no encontrado
          console.error("Mercado no encontrado");
        }
      } catch (error) {
        console.error("Error al cargar mercado:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadMarket();
    }
  }, [id, connected]);
  
  // Manejar la resolución del mercado
  const handleMarketResolved = async (result) => {
    try {
      // Recargar el mercado para reflejar los cambios
      const markets = await mockBlockchain.markets.getAllMarkets();
      const updatedMarket = markets.find(m => m.id === id);
      if (updatedMarket) {
        setMarket(updatedMarket);
      }
    } catch (error) {
      console.error("Error al recargar el mercado:", error);
    }
  };
  
  const handlePlaceBet = () => {
    if (!connected) {
      setShowAuthPrompt(true);
      return;
    }
    
    // Aquí iría la lógica de apuesta real
    alert(`Apuesta de ${betAmount} CHIPS a "${betOption === 'yes' ? 'Sí' : 'No'}" realizada con éxito!`);
  };
  
  // Calcular porcentaje para la visualización
  const getYesPercentage = () => {
    if (!market || (!market.yesPool && !market.noPool)) return 50;
    return Math.round((market.yesPool / (market.yesPool + market.noPool)) * 100);
  };
  
  const getNoPercentage = () => {
    if (!market || (!market.yesPool && !market.noPool)) return 50;
    return Math.round((market.noPool / (market.yesPool + market.noPool)) * 100);
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white" style={{
        backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-[#00e5ff] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando detalles del mercado...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!market) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white" style={{
        backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-[#151515] border-l-4 border-[#ff3366] text-[#ff3366] p-4 mb-4 rounded">
            <p className="font-bold">Error</p>
            <p>Mercado no encontrado</p>
          </div>
          <button
            className="bg-[#00e5ff] hover:bg-[#00b8cc] text-black font-bold py-2 px-4 rounded transition-all"
            onClick={() => router.push('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
  
  // Preparar datos para el gráfico
  const chartData = {
    yesPercentage: getYesPercentage(),
    noPercentage: getNoPercentage()
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{
      backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }}>
      <div className="container mx-auto px-4 py-6">
        {/* Banner de gamificación */}
        <div className="flex items-center gap-3 mb-6 py-3 px-4 bg-[#151520] rounded-lg border border-[#222] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#3b216d] to-transparent opacity-10"></div>
          <div className="bg-[#9945FF] text-white rounded-full w-10 h-10 flex items-center justify-center z-10">
            🏆
          </div>
          <div className="z-10">
            <p className="font-medium text-white">¡Participa y gana!</p>
            <p className="text-sm text-gray-300">Los usuarios que acierten recibirán 2x CHIPS y 50 puntos de reputación</p>
          </div>
          <button className="ml-auto bg-[#9945FF] hover:bg-[#8935ef] text-white text-sm py-1 px-3 rounded-full z-10">
            Reglas del juego
          </button>
        </div>

        {/* Navegación superior */}
        <div className="mb-4">
          <Link 
            href="/"
            className="text-[#00e5ff] flex items-center hover:text-[#00b8cc] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver a mercados
          </Link>
        </div>
        
        {/* Título y descripción principal */}
        <div className="bg-[#151515] rounded-lg overflow-hidden border border-[#222] mb-6">
          <div className="relative">
            {/* Imagen destacada del mercado */}
            <MarketImage market={market} height={240} className="w-full" />
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{market.title}</h1>
                  <div className="flex items-center gap-2">
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
                    
                    {market.resolutionType && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        market.resolutionType === 'automatic' 
                          ? 'bg-[#102030] text-[#00e5ff]' 
                          : 'bg-[#201020] text-[#9945FF]'
                      }`}>
                        Resolución: {market.resolutionType === 'automatic' ? 'Automática' : 'Manual verificada'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-base text-gray-300 mb-3 max-w-3xl">{market.description}</p>
                <div className="flex flex-wrap items-center text-sm text-gray-400 gap-4">
                  <span>
                    <span className="font-medium">Creado:</span> {formatDate(market.createdAt)}
                  </span>
                  <span>
                    <span className="font-medium">Finaliza:</span> {formatDate(market.endDate)}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[#151520] text-[#00e5ff] border border-[#222]">
                    {market.category || "Criptomonedas"}
                  </span>
                </div>
              </div>
              
              {/* Estado actual */}
              <div className="bg-[#101010] rounded-lg p-3 border border-[#222] min-w-[250px]">
                <div className="tabs flex border-b border-[#222222]">
                  <div className="tab tab-bordered tab-active text-[#00e5ff] py-2 px-4 border-b-2 border-[#00e5ff] font-medium">Buy</div>
                  <div className="tab tab-bordered text-gray-400 py-2 px-4 font-medium">Sell</div>
                </div>
                
                <div className="py-2">
                  <div className="flex justify-between mb-1">
                    <span className={`text-[#00ff88] ${market.resolvedOption === 'yes' ? 'font-bold' : ''}`}>
                      Sí ({market.yesPool} CHIPS)
                      {market.resolvedOption === 'yes' && <span className="ml-1 text-xs">✓ Ganador</span>}
                    </span>
                    <span className={`text-[#ff3366] ${market.resolvedOption === 'no' ? 'font-bold' : ''}`}>
                      No ({market.noPool} CHIPS)
                      {market.resolvedOption === 'no' && <span className="ml-1 text-xs">✓ Ganador</span>}
                    </span>
                  </div>
                  <div className={`h-8 bg-[#0a0a0a] rounded-full overflow-hidden ${market.resolvedOption ? 'opacity-70' : ''}`}>
                    <div 
                      className={`h-full bg-[#00ff88] float-left rounded-l-full ${market.resolvedOption === 'yes' ? 'animate-pulse' : ''}`}
                      style={{ width: `${getYesPercentage()}%` }}
                    ></div>
                    <div 
                      className={`h-full bg-[#ff3366] float-right rounded-r-full ${market.resolvedOption === 'no' ? 'animate-pulse' : ''}`}
                      style={{ width: `${getNoPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400 text-sm">{getYesPercentage()}%</span>
                    <span className="text-gray-400 text-sm">{getNoPercentage()}%</span>
                  </div>
                  
                  {market.status === 'resolved' && (
                    <div className="mt-3 p-2 bg-[#101010] rounded border border-[#222] text-center">
                      <p className="text-sm">
                        Este mercado ha sido resuelto a <span className={`font-bold ${market.resolvedOption === 'yes' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                          {market.resolvedOption === 'yes' ? 'SÍ' : 'NO'}
                        </span>
                      </p>
                      {market.resolutionDetails && market.resolutionDetails.source && (
                        <p className="text-xs text-gray-400 mt-1">
                          Fuente: {market.resolutionDetails.source}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Resuelto el {formatDate(market.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex mt-4 gap-2">
                  <button 
                    className={`flex-1 py-2 text-center font-medium rounded transition-all ${
                      market.status === 'open'
                        ? 'bg-[#102010] hover:bg-[#00ff88] text-[#00ff88] hover:text-black'
                        : 'bg-[#101010] text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={market.status !== 'open'}
                  >
                    Yes {getYesPercentage()}¢
                  </button>
                  <button 
                    className={`flex-1 py-2 text-center font-medium rounded transition-all ${
                      market.status === 'open'
                        ? 'bg-[#200a10] hover:bg-[#ff3366] text-[#ff3366] hover:text-white'
                        : 'bg-[#101010] text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={market.status !== 'open'}
                  >
                    No {getNoPercentage()}¢
                  </button>
                </div>
                
                {isAdmin && market.status === 'open' && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="w-full py-2 text-center bg-[#102030] hover:bg-[#00e5ff] text-[#00e5ff] hover:text-black font-medium rounded transition-all"
                    >
                      Resolver Mercado
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Layout principal - Grid con dos columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información del mercado */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico de evolución */}
            <div className="bg-[#151515] rounded-lg p-6 border border-[#222]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Evolución de Probabilidades</h2>
                
                {/* Filtros de tiempo */}
                <div className="flex space-x-1 bg-[#101010] rounded-lg p-1">
                  <button 
                    onClick={() => setChartPeriod('1h')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      chartPeriod === '1h' ? 'bg-[#202020] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1H
                  </button>
                  <button 
                    onClick={() => setChartPeriod('6h')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      chartPeriod === '6h' ? 'bg-[#202020] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    6H
                  </button>
                  <button 
                    onClick={() => setChartPeriod('1d')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      chartPeriod === '1d' ? 'bg-[#202020] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1D
                  </button>
                  <button 
                    onClick={() => setChartPeriod('1w')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      chartPeriod === '1w' ? 'bg-[#202020] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1W
                  </button>
                  <button 
                    onClick={() => setChartPeriod('1m')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      chartPeriod === '1m' ? 'bg-[#202020] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1M
                  </button>
                  <button 
                    onClick={() => setChartPeriod('all')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      chartPeriod === 'all' ? 'bg-[#202020] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ALL
                  </button>
                </div>
              </div>
              
              {/* Chart.js Component */}
              <ProbabilityChart 
                period={chartPeriod} 
                marketData={chartData}
                yesLabel="SÍ"
                noLabel="NO"
              />
            </div>
            
            {/* Order Book - Colapsable */}
            <div className="bg-[#151515] rounded-lg border border-[#222] overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 border-b border-[#222] cursor-pointer" 
                onClick={() => setShowOrderBook(!showOrderBook)}
              >
                <h3 className="font-medium text-white flex items-center">
                  <span>Order Book</span>
                  {!showOrderBook && <span className="text-xs text-gray-400 ml-2">(Click para expandir)</span>}
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showOrderBook ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              
              {showOrderBook && (
                <div className="p-4">
                  {/* Tabs */}
                  <div className="flex border-b border-[#222] mb-4">
                    <button className="text-[#00e5ff] py-2 px-4 text-sm border-b-2 border-[#00e5ff]">
                      Trade Yes
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 py-2 px-4 text-sm">
                      Trade No
                    </button>
                  </div>
                  
                  {/* Header */}
                  <div className="grid grid-cols-3 mb-2 text-xs text-gray-500">
                    <div>TRADE YES</div>
                    <div className="text-right">PRICE</div>
                    <div className="text-right">TOTAL</div>
                  </div>
                  
                  {/* Asks */}
                  <div className="mb-4">
                    <div className="grid grid-cols-3 mb-1 py-1 text-sm border-b border-[#181818]">
                      <div className="text-gray-400">
                        <div className="bg-red-900 bg-opacity-20 h-full flex items-center px-1 rounded">
                          <span className="text-xs">Asks</span>
                        </div>
                      </div>
                      <div className="text-right text-[#ff3366]">96.3¢</div>
                      <div className="text-right text-gray-300">$215.09</div>
                    </div>
                    <div className="grid grid-cols-3 py-1 text-sm border-b border-[#181818]">
                      <div></div>
                      <div className="text-right text-[#ff3366]">96.4¢</div>
                      <div className="text-right text-gray-300">$1,261.99</div>
                    </div>
                    <div className="grid grid-cols-3 py-1 text-sm border-b border-[#181818]">
                      <div></div>
                      <div className="text-right text-[#ff3366]">96.5¢</div>
                      <div className="text-right text-gray-300">$1,960.65</div>
                    </div>
                  </div>
                  
                  {/* Last price */}
                  <div className="grid grid-cols-3 py-2 text-sm border-b border-[#181818]">
                    <div className="text-gray-400">Last:</div>
                    <div className="text-right text-white">95.8¢</div>
                    <div className="text-right text-gray-400">Spread: 0.7¢</div>
                  </div>
                  
                  {/* Bids */}
                  <div className="mt-4">
                    <div className="grid grid-cols-3 mb-1 py-1 text-sm border-b border-[#181818]">
                      <div className="text-gray-400">
                        <div className="bg-green-900 bg-opacity-20 h-full flex items-center px-1 rounded">
                          <span className="text-xs">Bids</span>
                        </div>
                      </div>
                      <div className="text-right text-[#00ff88]">95.6¢</div>
                      <div className="text-right text-gray-300">$4,390.53</div>
                    </div>
                    <div className="grid grid-cols-3 py-1 text-sm border-b border-[#181818]">
                      <div></div>
                      <div className="text-right text-[#00ff88]">95.5¢</div>
                      <div className="text-right text-gray-300">$4,708.55</div>
                    </div>
                    <div className="grid grid-cols-3 py-1 text-sm border-b border-[#181818]">
                      <div></div>
                      <div className="text-right text-[#00ff88]">95.4¢</div>
                      <div className="text-right text-gray-300">$5,662.55</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Market Summary AI */}
            <MarketSummaryAI market={market} />
            
            {/* Reglas del Mercado - Colapsable */}
            <div className="bg-[#151515] rounded-lg border border-[#222] overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 border-b border-[#222] cursor-pointer" 
                onClick={() => setShowRules(!showRules)}
              >
                <h3 className="font-medium text-white flex items-center">
                  <span>Reglas del Mercado</span>
                  {!showRules && <span className="text-xs text-gray-400 ml-2">(Click para expandir)</span>}
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showRules ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              
              {showRules && (
                <div className="p-4">
                  <p className="text-gray-300 text-sm mb-3">
                    Este mercado se resolverá a "Sí" si {market.title.replace('?', '')}.
                  </p>
                  <p className="text-gray-300 text-sm">
                    La fecha de resolución será posterior al evento. El resultado se determinará por fuentes oficiales.
                  </p>
                </div>
              )}
            </div>
            
            {/* Detalles del Mercado - Colapsable */}
            <div className="bg-[#151515] rounded-lg border border-[#222] overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 border-b border-[#222] cursor-pointer"
                onClick={() => setShowDetails(!showDetails)}
              >
                <h3 className="font-medium text-white flex items-center">
                  <span>Detalles del Mercado</span>
                  {!showDetails && <span className="text-xs text-gray-400 ml-2">(Click para expandir)</span>}
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              
              {showDetails && (
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creador</span>
                    <span className="text-white font-mono bg-[#101010] px-2 py-1 rounded">{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID del Mercado</span>
                    <span className="text-white font-mono bg-[#101010] px-2 py-1 rounded">{market.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolución</span>
                    <span className={`${
                      market.resolvedOption 
                        ? market.resolvedOption === 'yes' 
                          ? 'text-[#00ff88] font-medium' 
                          : 'text-[#ff3366] font-medium' 
                        : 'text-white'
                    }`}>
                      {market.resolvedOption 
                        ? market.resolvedOption === 'yes' 
                          ? 'SÍ' 
                          : 'NO' 
                        : 'Pendiente'}
                    </span>
                  </div>
                  
                  {market.resolvedOption && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha de resolución</span>
                      <span className="text-white">{formatDate(market.resolvedAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo de resolución</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      market.resolutionType === 'automatic' 
                        ? 'bg-[#102030] text-[#00e5ff]' 
                        : 'bg-[#201020] text-[#9945FF]'
                    }`}>
                      {market.resolutionType === 'automatic' ? 'Automática' : 'Manual verificada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comisión</span>
                    <span className="text-white">2%</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tabs para mostrar diferentes secciones */}
            <div className="bg-[#151515] rounded-lg border border-[#222] overflow-hidden">
              <div className="flex border-b border-[#222]">
                <button 
                  className={`px-4 py-3 font-medium text-sm ${activeTab === 'comments' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comentarios (32)
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm ${activeTab === 'topHolders' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('topHolders')}
                >
                  Top Holders
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm ${activeTab === 'activity' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('activity')}
                >
                  Actividad
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm ${activeTab === 'related' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('related')}
                >
                  Relacionados
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'comments' && (
                  <div>
                    <div className="mb-4">
                      <textarea 
                        className="w-full bg-[#101010] border border-[#222] rounded-md p-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#00e5ff]"
                        placeholder="Añadir un comentario..."
                        rows="3"
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button 
                          className={`px-4 py-2 font-medium rounded transition-all ${
                            connected 
                              ? 'bg-[#00e5ff] hover:bg-[#00b8cc] text-black' 
                              : 'bg-[#151520] text-gray-400'
                          }`}
                          disabled={!connected}
                        >
                          {connected ? 'Publicar' : 'Conéctate para comentar'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3 p-3 border-b border-[#222]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">wallet...4f2d</span>
                            <span className="text-xs text-gray-400">1h ago</span>
                          </div>
                          <p className="text-gray-300 mt-1">Creo que esto va a ser super interesante de ver cómo se desarrolla.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-3 border-b border-[#222]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex-shrink-0"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">BlockGenius</span>
                            <span className="text-xs text-gray-400">3h ago</span>
                          </div>
                          <p className="text-gray-300 mt-1">Las probabilidades han cambiado mucho en las últimas horas. Parece que el mercado está indeciso.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'topHolders' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-[#00ff88]">Yes holders</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-green-400"></div>
                            <span className="text-gray-300">wallet...e12d</span>
                          </div>
                          <span className="text-[#00ff88]">420 CHIPS</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                            <span className="text-gray-300">wallet...92ff</span>
                          </div>
                          <span className="text-[#00ff88]">280 CHIPS</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-[#ff3366]">No holders</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-yellow-400"></div>
                            <span className="text-gray-300">wallet...51ac</span>
                          </div>
                          <span className="text-[#ff3366]">380 CHIPS</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-red-400"></div>
                            <span className="text-gray-300">wallet...3f7b</span>
                          </div>
                          <span className="text-[#ff3366]">210 CHIPS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'activity' && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-300 flex justify-between items-center border-b border-[#181818] pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                        <span>wallet...4f2d</span>
                      </div>
                      <span className="text-[#00ff88]">+420 CHIPS a Sí</span>
                      <span className="text-gray-400">1h ago</span>
                    </div>
                    
                    <div className="text-sm text-gray-300 flex justify-between items-center border-b border-[#181818] pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500"></div>
                        <span>wallet...92ff</span>
                      </div>
                      <span className="text-[#ff3366]">+180 CHIPS a No</span>
                      <span className="text-gray-400">3h ago</span>
                    </div>
                    
                    <div className="text-sm text-gray-300 flex justify-between items-center border-b border-[#181818] pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"></div>
                        <span>wallet...51ac</span>
                      </div>
                      <span className="text-[#00ff88]">+65 CHIPS a Sí</span>
                      <span className="text-gray-400">5h ago</span>
                    </div>
                  </div>
                )}
                
                {activeTab === 'related' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#101010] p-4 rounded-lg border border-[#222] flex justify-between items-center hover:border-[#00e5ff] transition-all cursor-pointer">
                      <div>
                        <h4 className="font-medium text-white">¿Bitcoin superará los $100k en 2025?</h4>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="text-gray-400">$2,450 Vol.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="bg-[#102010] text-[#00ff88] px-2 py-1 rounded text-sm">
                          Sí 76¢
                        </button>
                        <button className="bg-[#200a10] text-[#ff3366] px-2 py-1 rounded text-sm">
                          No 24¢
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-[#101010] p-4 rounded-lg border border-[#222] flex justify-between items-center hover:border-[#00e5ff] transition-all cursor-pointer">
                      <div>
                        <h4 className="font-medium text-white">¿Ethereum superará a Bitcoin en 2025?</h4>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="text-gray-400">$1,780 Vol.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="bg-[#102010] text-[#00ff88] px-2 py-1 rounded text-sm">
                          Sí 35¢
                        </button>
                        <button className="bg-[#200a10] text-[#ff3366] px-2 py-1 rounded text-sm">
                          No 65¢
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Columna derecha - Panel de trading */}
          <div className="lg:col-span-1">
            <div className="bg-[#151515] rounded-lg border border-[#222] sticky top-4">
              <div className="tabs flex border-b border-[#222222]">
                <div className="tab tab-bordered tab-active text-[#00e5ff] py-3 px-4 border-b-2 border-[#00e5ff] font-medium flex-1 text-center">Buy</div>
                <div className="tab tab-bordered text-gray-400 py-3 px-4 font-medium flex-1 text-center">Sell</div>
              </div>
              
              <div className="p-4">
                {/* Selección de opción para apostar */}
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <button
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        betOption === 'yes'
                          ? 'bg-[#00ff88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                          : 'bg-[#101010] text-gray-300 hover:bg-[#151515] border border-[#222]'
                      }`}
                      onClick={() => setBetOption('yes')}
                    >
                      Yes {getYesPercentage()}¢
                    </button>
                    <button
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        betOption === 'no'
                          ? 'bg-[#ff3366] text-white shadow-[0_0_10px_rgba(255,51,102,0.3)]'
                          : 'bg-[#101010] text-gray-300 hover:bg-[#151515] border border-[#222]'
                      }`}
                      onClick={() => setBetOption('no')}
                    >
                      No {getNoPercentage()}¢
                    </button>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-gray-300 text-sm">Monto (CHIPS)</label>
                    <span className="text-2xl font-bold text-white">${betAmount}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button 
                      onClick={() => setBetAmount(1)} 
                      className="px-3 py-1 bg-[#202020] hover:bg-[#252525] rounded text-sm text-gray-300 transition-colors"
                    >
                      +$1
                    </button>
                    <button 
                      onClick={() => setBetAmount(betAmount + 20)} 
                      className="px-3 py-1 bg-[#202020] hover:bg-[#252525] rounded text-sm text-gray-300 transition-colors"
                    >
                      +$20
                    </button>
                    <button 
                      onClick={() => setBetAmount(betAmount + 100)} 
                      className="px-3 py-1 bg-[#202020] hover:bg-[#252525] rounded text-sm text-gray-300 transition-colors"
                    >
                      +$100
                    </button>
                    <button 
                      onClick={() => setBetAmount(connected ? balance : 1000)} 
                      className="px-3 py-1 bg-[#202020] hover:bg-[#252525] rounded text-sm text-gray-300 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                  
                  <input
                    className="w-full bg-[#101010] border border-[#222] rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#00e5ff]"
                    type="number"
                    min="1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    disabled={market.status !== 'open'}
                  />
                </div>
                
                {/* Potential winnings */}
                <div className="bg-[#101010] p-3 rounded mb-4 border border-[#222]">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-400">Ganancias potenciales:</p>
                    <span className="text-xs text-gray-500">1.8x</span>
                  </div>
                  <p className="text-2xl font-bold text-[#00e5ff]">{(betAmount * 1.8).toFixed(2)} CHIPS</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Si tu predicción es correcta, ganarás aproximadamente 1.8x tu apuesta.
                  </p>
                </div>
                
                {/* Trade button */}
                {market.status === 'open' ? (
                  connected ? (
                    <button
                      className={`w-full py-3 px-6 rounded-lg font-bold text-black transition-all ${
                        betOption === 'yes' 
                          ? 'bg-[#00ff88] hover:bg-[#00cc6f] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]' 
                          : 'bg-[#ff3366] hover:bg-[#cc2952] hover:shadow-[0_0_15px_rgba(255,51,102,0.3)] text-white'
                      }`}
                      onClick={handlePlaceBet}
                    >
                      {`Apostar ${betAmount} CHIPS a "${betOption === 'yes' ? 'Sí' : 'No'}"`}
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 px-6 rounded-lg font-bold text-black bg-[#00e5ff] hover:bg-[#00b8cc] transition-all"
                      onClick={() => setShowAuthPrompt(true)}
                    >
                      Login to Trade
                    </button>
                  )
                ) : (
                  <button
                    className="w-full py-3 px-6 rounded-lg font-bold bg-[#151520] text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    {market.status === 'resolved' 
                      ? `Mercado resuelto a ${market.resolvedOption === 'yes' ? 'SÍ' : 'NO'}` 
                      : 'Mercado cerrado'}
                  </button>
                )}
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Al tradear, aceptas nuestros <a href="#" className="text-[#00e5ff]">Términos de Uso</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de autenticación */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#151515] rounded-lg p-6 max-w-md w-full border border-[#222] animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="bg-[#00e5ff] rounded-full p-2 text-black mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Conecta tu wallet para continuar</h3>
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
        
        {/* Modal de resolución de mercado */}
        {market && (
          <ResolveMarketModal 
            market={market}
            isOpen={showResolveModal}
            onClose={() => setShowResolveModal(false)}
            onResolved={handleMarketResolved}
          />
        )}
      </div>
    </div>
  );
}