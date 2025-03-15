// src/app/markets/[id]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '../../../contexts/WalletContext';
import { mockBlockchain } from '../../../services/mockBlockchain';

export default function MarketDetail() {
  const router = useRouter();
  const { id } = useParams();
  const { publicKey, connected, balance, connect } = useWallet();
  
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [betOption, setBetOption] = useState('yes');
  const [betAmount, setBetAmount] = useState(10);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  useEffect(() => {
    const loadMarket = async () => {
      setLoading(true);
      try {
        // Obtener los mercados (simulado)
        const markets = await mockBlockchain.markets.getAllMarkets();
        const foundMarket = markets.find(m => m.id === id);
        
        if (foundMarket) {
          setMarket(foundMarket);
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
  }, [id]);
  
  const handlePlaceBet = () => {
    if (!connected) {
      setShowAuthPrompt(true);
      return;
    }
    
    // Aquí iría la lógica de apuesta real
    alert(`Apuesta de ${betAmount} CHIPS a "${betOption === 'yes' ? 'Sí' : 'No'}" realizada con éxito!`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
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
      <div className="min-h-screen bg-[#0a0a0a] text-white">
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
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
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

        {/* Encabezado del mercado */}
        <div className="mb-8">
          <button 
            className="text-[#00e5ff] mb-4 flex items-center hover:text-[#00b8cc] transition-colors"
            onClick={() => router.push('/')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver a mercados
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{market.title}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              market.status === 'open' 
                ? 'bg-[#102010] text-[#00ff88]' 
                : 'bg-[#101010] text-gray-400'
            }`}>
              {market.status === 'open' ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          <p className="text-lg text-gray-300 mb-4">{market.description}</p>
          <div className="flex flex-wrap items-center text-sm text-gray-400 mb-4 gap-4">
            <span>
              <span className="font-medium">Creado:</span> {new Date(market.createdAt).toLocaleDateString()}
            </span>
            <span>
              <span className="font-medium">Finaliza:</span> {new Date(market.endDate || "2024-12-31").toLocaleDateString()}
            </span>
            <span className="px-2 py-1 rounded-full bg-[#151520] text-[#00e5ff] border border-[#222]">
              {market.category || "Criptomonedas"}
            </span>
          </div>
        </div>
        
        {/* Visualización de probabilidades */}
        <div className="bg-[#151515] rounded-lg shadow-md p-6 mb-8 border border-[#222]">
          <h2 className="text-xl font-bold mb-4 text-white">Estado del Mercado</h2>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-[#00ff88]">Sí ({market.yesPool || 0} CHIPS)</span>
              <span className="font-medium text-[#ff3366]">No ({market.noPool || 0} CHIPS)</span>
            </div>
            <div className="h-8 bg-[#0a0a0a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00ff88] float-left rounded-l-full"
                style={{ width: `${market.yesPool ? (market.yesPool / (market.yesPool + market.noPool) * 100) : 50}%` }}
              ></div>
              <div 
                className="h-full bg-[#ff3366] float-right rounded-r-full"
                style={{ width: `${market.noPool ? (market.noPool / (market.yesPool + market.noPool) * 100) : 50}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span className="text-gray-400">{market.yesPool ? ((market.yesPool / (market.yesPool + market.noPool) * 100) || 0).toFixed(1) : 50}%</span>
              <span className="text-gray-400">{market.noPool ? ((market.noPool / (market.yesPool + market.noPool) * 100) || 0).toFixed(1) : 50}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-[#101010] p-3 rounded border border-[#222]">
              <p className="text-sm text-gray-400">Total apostado</p>
              <p className="text-xl font-bold text-[#00e5ff]">{(market.yesPool || 0) + (market.noPool || 0)} CHIPS</p>
            </div>
            <div className="bg-[#101010] p-3 rounded border border-[#222]">
              <p className="text-sm text-gray-400">Apuestas totales</p>
              <p className="text-xl font-bold text-[#00e5ff]">{market.totalBets || 0}</p>
            </div>
          </div>
        </div>

        {/* Sección de Evolución de Probabilidades */}
        <div className="mb-8 bg-[#151515] p-6 rounded-lg border border-[#222]">
          <h3 className="text-lg font-semibold mb-3 text-white">Evolución de Probabilidades</h3>
          <div className="bg-[#101010] p-4 rounded-lg border border-[#222]">
            <div className="h-64 w-full relative">
              {/* Fondo de cuadrícula */}
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), 
                                  linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
            
              {/* Ejes */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#333]"></div>
              <div className="absolute left-0 bottom-0 h-full w-0.5 bg-[#333]"></div>
              
              {/* Línea verde (Sí) - Curva suave actualizada */}
              {/* <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d="M0,50 C10,45 20,40 30,35 C40,30 50,25 65,20 C75,18 85,15 100,10" 
                  fill="none" 
                  stroke="#00ff88" 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg> */}
              
              {/* Línea roja (No) - Curva suave actualizada */}
              {/* <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d="M0,50 C10,55 20,60 30,65 C40,70 50,75 65,80 C75,82 85,85 100,90" 
                  fill="none" 
                  stroke="#ff3366" 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg> */}
              
              {/* Puntos destacados en la curva verde */}
              {/* <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="30" cy="35" r="0.8" fill="#00ff88" />
                <circle cx="65" cy="20" r="0.8" fill="#00ff88" />
                <circle cx="100" cy="10" r="0.8" fill="#00ff88" />
              </svg> */}
              
              {/* Puntos destacados en la curva roja */}
              {/* <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="30" cy="65" r="0.8" fill="#ff3366" />
                <circle cx="65" cy="80" r="0.8" fill="#ff3366" />
                <circle cx="100" cy="90" r="0.8" fill="#ff3366" />
              </svg> */}
              
              {/* Área bajo la curva verde con efecto de gradiente */}
              {/* <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,50 C10,45 20,40 30,35 C40,30 50,25 65,20 C75,18 85,15 100,10 L100,100 L0,100 Z" 
                  fill="url(#greenGradient)"
                  stroke="none"
                />
              </svg> */}
              
              {/* Área bajo la curva roja con efecto de gradiente */}
              {/* <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff3366" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ff3366" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,50 C10,55 20,60 30,65 C40,70 50,75 65,80 C75,82 85,85 100,90 L100,100 L0,100 Z" 
                  fill="url(#redGradient)"
                  stroke="none"
                />
              </svg> */}
              
              {/* Etiquetas */}
              <div className="absolute top-4 right-4 flex items-center space-x-4 bg-[#0a0a0a80] backdrop-blur-sm p-2 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#00ff88] rounded-full mr-1"></div>
                  <span className="text-sm text-gray-300">SÍ</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#ff3366] rounded-full mr-1"></div>
                  <span className="text-sm text-gray-300">NO</span>
                </div>
              </div>
              
              {/* Fechas en el eje X */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>1 mar</span>
                <span>15 mar</span>
                <span>1 abr</span>
                <span>15 abr</span>
                <span>Hoy</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de apuesta */}
        <div className="bg-[#151515] rounded-lg shadow-md p-6 mb-8 border border-[#222]">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Realizar una Apuesta
          </h2>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              ¿Cuál es tu predicción?
            </label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  betOption === 'yes'
                    ? 'bg-[#00ff88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                    : 'bg-[#101010] text-gray-300 hover:bg-[#151515] border border-[#222]'
                }`}
                onClick={() => setBetOption('yes')}
              >
                Sí
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  betOption === 'no'
                    ? 'bg-[#ff3366] text-white shadow-[0_0_10px_rgba(255,51,102,0.3)]'
                    : 'bg-[#101010] text-gray-300 hover:bg-[#151515] border border-[#222]'
                }`}
                onClick={() => setBetOption('no')}
              >
                No
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="betAmount">
              Monto de la Apuesta (CHIPS)
            </label>
            <div className="flex items-center">
              <input
                className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded-l w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                id="betAmount"
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
              <button onClick={() => setBetAmount(500)} className="hover:text-[#00e5ff]">500</button>
              <button onClick={() => connected ? setBetAmount(balance) : setBetAmount(1000)} className="hover:text-[#00e5ff]">MAX</button>
            </div>
          </div>
          
          <div className="bg-[#101010] p-4 rounded mb-6 border border-[#222]">
            <div className="flex justify-between mb-1">
              <p className="text-sm text-gray-400">Ganancias potenciales:</p>
              <span className="text-xs text-gray-500">1.8x</span>
            </div>
            <p className="text-2xl font-bold text-[#00e5ff]">{(betAmount * 1.8).toFixed(2)} CHIPS</p>
            <p className="text-xs text-gray-400 mt-1">
              Si tu predicción es correcta, ganarás aproximadamente 1.8x tu apuesta.
            </p>
          </div>
          
          <button
            className={`w-full py-3 px-6 rounded-lg font-bold text-black transition-all ${
              betOption === 'yes' 
                ? 'bg-[#00ff88] hover:bg-[#00cc6f] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]' 
                : 'bg-[#ff3366] hover:bg-[#cc2952] hover:shadow-[0_0_15px_rgba(255,51,102,0.3)]'
            }`}
            onClick={handlePlaceBet}
          >
            {`Apostar ${betAmount} CHIPS a "${betOption === 'yes' ? 'Sí' : 'No'}"`}
          </button>
        </div>
        
        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#151515] rounded-lg p-6 border border-[#222]">
            <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Detalles del Mercado
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Creador</span>
                <span className="text-white font-mono bg-[#101010] px-2 py-1 rounded">{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ID del Mercado</span>
                <span className="text-white font-mono bg-[#101010] px-2 py-1 rounded">{market.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Resolución</span>
                <span className="text-white">{market.resolvedOption ? (market.resolvedOption === 'yes' ? 'SÍ' : 'NO') : 'Pendiente'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Comisión</span>
                <span className="text-white">2%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#151515] rounded-lg p-6 border border-[#222]">
            <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Historial de Apuestas
            </h3>
            {market.totalBets > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-[#222] scrollbar-track-[#101010]">
                <div className="flex justify-between text-sm p-2 bg-[#101010] rounded">
                  <span className="text-gray-400 font-mono">0xf3b9...e12d</span>
                  <span className="text-[#00ff88]">+420 CHIPS a Sí</span>
                  <span className="text-gray-400">1h ago</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-[#101010] rounded">
                  <span className="text-gray-400 font-mono">0x43a1...92ff</span>
                  <span className="text-[#ff3366]">+180 CHIPS a No</span>
                  <span className="text-gray-400">3h ago</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-[#101010] rounded">
                  <span className="text-gray-400 font-mono">0x9e7d...51ac</span>
                  <span className="text-[#00ff88]">+65 CHIPS a Sí</span>
                  <span className="text-gray-400">5h ago</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No hay apuestas todavía. ¡Sé el primero!</p>
            )}
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
      </div>
    </div>
  );
}