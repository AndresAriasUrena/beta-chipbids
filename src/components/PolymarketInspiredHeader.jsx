// Componente de header inspirado en Polymarket para ChipBids
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PolymarketInspiredHeader({ connected, publicKey, balance, connect, disconnect, loading }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Categorías principales para la barra superior
  const mainCategories = [
    { id: 'all', name: 'Todos' },
    { id: 'new', name: 'Nuevos' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'sports', name: 'Deportes' },
    { id: 'politics', name: 'Política' },
    { id: 'technology', name: 'Tecnología' },
    { id: 'entertainment', name: 'Entretenimiento' },
    { id: 'trending', name: 'Tendencias' },
  ];
  
  // Mercados destacados para la segunda barra (simulados)
  const trendingMarkets = [
    { id: 'top', name: 'Top' },
    { id: 'bitcoin-100k', name: 'Bitcoin $100K' },
    { id: 'election', name: 'Elecciones' },
    { id: 'worldcup', name: 'Mundial' },
    { id: 'messi', name: 'Messi' },
    { id: 'nfl', name: 'NFL' },
    { id: 'nba', name: 'NBA' },
    { id: 'solana', name: 'Solana' },
    { id: 'airdrop', name: 'Airdrops' },
    { id: 'movies', name: 'Películas' },
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log(`Buscando: ${searchTerm}`);
      // Implementar la navegación a la página de resultados de búsqueda
      // router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      alert(`Buscando: ${searchTerm}`); // Solo para demostración
    }
  };
  
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    // Implementar la navegación o filtrado por categoría
    // router.push(`/markets?category=${categoryId}`);
  };

  return (
    <header className="w-full">
      {/* Barra superior - Logo, búsqueda y conexión de wallet */}
      <div className="bg-[#0e111a] border-b border-[#1c2030] py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo y búsqueda */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center mr-6">
              <div className="text-2xl font-bold text-[#00e5ff] neon-text">ChipBids</div>
              <span className="ml-2 bg-[#00ff88] text-black px-2 py-0.5 rounded-full text-xs font-bold">BETA</span>
            </Link>
            
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-[#161924] border border-[#212636] rounded-lg py-2 px-4 pr-10 text-white focus:outline-none focus:border-[#00e5ff] placeholder-gray-500"
                  placeholder="Buscar mercados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          {/* Navegación de la derecha y wallet */}
          <div className="flex items-center space-x-4 ml-4">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/markets" className="text-gray-300 hover:text-white text-sm">Mercados</Link>
              <Link href="/games" className="text-gray-300 hover:text-white text-sm">Juegos</Link>
              <Link href="/leaderboard" className="text-gray-300 hover:text-white text-sm">Ranking</Link>
            </div>
            
            {!connected ? (
              <button 
                className="bg-[#00e5ff] hover:bg-[#00b8cc] text-black font-medium py-1.5 px-4 rounded transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                onClick={connect}
                disabled={loading}
              >
                {loading ? 'Conectando...' : 'Conectar Wallet'}
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="bg-[#1c2030] px-3 py-1.5 rounded text-sm">
                  <span className="font-bold text-[#00e5ff]">{balance}</span> <span className="text-gray-400">CHIPS</span>
                </span>
                <span className="bg-[#1c2030] px-3 py-1.5 rounded text-xs truncate max-w-[120px]" title={publicKey}>
                  {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                </span>
                <button 
                  className="bg-[#ff3366] hover:bg-[#cc2952] text-white text-sm py-1.5 px-2 rounded transition-all"
                  onClick={disconnect}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Segunda barra - Categorías principales */}
      <div className="bg-[#0a0c14] border-b border-[#1c2030] py-2 px-4 overflow-x-auto">
        <div className="container mx-auto flex items-center space-x-1">
          <div className="inline-flex">
            <span className="inline-flex items-center text-[#ff3366] px-1 mr-1">
              <span className="w-2 h-2 bg-[#ff3366] rounded-full mr-1 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase">LIVE</span>
            </span>
          </div>
          
          {mainCategories.map((category) => (
            <button
              key={category.id}
              className={`px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
          
          <Link 
            href="/minigames" 
            className="px-3 py-1 text-sm font-medium whitespace-nowrap text-[#00ff88] hover:text-[#40ffa0] transition-colors flex items-center"
          >
            <span>Minijuegos</span>
            <span className="ml-1 text-xs bg-[#102010] text-[#00ff88] px-1.5 rounded">Nuevo</span>
          </Link>
        </div>
      </div>
      
      {/* Tercera barra - Mercados destacados y filtros */}
      <div className="bg-[#0a0c14] py-2 px-4 overflow-x-auto border-b border-[#1c2030]">
        <div className="container mx-auto flex items-center space-x-3">
          <div className="bg-[#00e5ff] text-black rounded p-1 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          
          <form className="relative max-w-[250px]">
            <input
              type="text"
              className="w-full bg-[#161924] border border-[#212636] rounded py-1 px-3 text-sm text-white focus:outline-none focus:border-[#00e5ff] placeholder-gray-500"
              placeholder="Buscar por mercado..."
            />
            <button 
              type="submit" 
              className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </form>
          
          <div className="flex items-center space-x-1 overflow-x-auto">
            {trendingMarkets.map((market) => (
              <button
                key={market.id}
                className="px-3 py-1 text-sm whitespace-nowrap transition-colors bg-[#161924] hover:bg-[#1a1e2c] text-gray-300 hover:text-white rounded-md"
              >
                {market.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}