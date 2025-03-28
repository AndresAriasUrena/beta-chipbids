// src/components/MarketImage.jsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Mapeo de títulos de mercado a nombres de archivo de imagen
const MARKET_IMAGE_MAPPING = {
  "¿Bitcoin superará los $100,000 antes de fin de año?": "/images/markets/bitcoin-price2.png",
  "¿Ethereum tendrá más de 500,000 validadores antes de julio?": "/images/markets/ethereum.png",
  "¿Ganará Argentina la Copa América 2025?": "/images/markets/argentina-football.png",
  "¿Real Madrid ganará la Champions League 2025-2026?": "/images/markets/real-madrid.png",
  "¿Se celebrarán elecciones anticipadas en España antes de octubre 2025?": "/images/markets/spain-politics.png",
  "¿Kamala Harris se presentará como candidata en 2028?": "/images/markets/harris.png",
  "¿La nueva temporada de House of the Dragon superará los 15 millones de espectadores?": "/images/markets/house-of-the-dragon.png",
  "¿La próxima película de Marvel superará los $1,000 millones en taquilla?": "/images/markets/marvel.png",
  "¿Apple lanzará sus gafas de realidad aumentada antes de septiembre?": "/images/markets/apple-ar.png",
  "¿SpaceX completará el primer aterrizaje tripulado en Marte antes de 2030?": "/images/markets/spacex-mars.png",
  "¿La temperatura global promedio de 2025 será la más alta registrada?": "/images/markets/global-warming.png",
  "¿Se descubrirá evidencia concluyente de vida extraterrestre antes de 2027?": "/images/markets/alien-life.png"
};

// Imágenes predeterminadas por categoría
const DEFAULT_IMAGES = {
  crypto: '/images/categories/crypto.png',
  sports: '/images/categories/sports.png',
  politics: '/images/categories/politics.png',
  entertainment: '/images/categories/entertainment.png',
  technology: '/images/categories/technology.png',
  other: '/images/categories/other.png',
  default: '/images/categories/default.png'
};

// Colores de gradiente por categoría para cuando no hay imagen
const CATEGORY_GRADIENTS = {
  crypto: 'from-blue-600 to-indigo-900',
  sports: 'from-green-600 to-emerald-900',
  politics: 'from-red-600 to-rose-900',
  entertainment: 'from-purple-600 to-fuchsia-900',
  technology: 'from-cyan-600 to-blue-900',
  other: 'from-amber-600 to-orange-900',
  default: 'from-gray-700 to-gray-900'
};

// Icono por categoría para cuando no hay imagen
const CATEGORY_ICONS = {
  crypto: '₿',   // Bitcoin symbol
  sports: '⚽',   // Soccer ball
  politics: '🏛️', // Classical building
  entertainment: '🎬', // Clapper board
  technology: '💻', // Laptop
  other: '🌐',    // Globe
  default: '📊'   // Chart
};

const MarketImage = ({ 
  market, 
  className = '', 
  showPlaceholder = true,
  height = 140
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  
  useEffect(() => {
    // Primero intentamos encontrar una imagen específica para este mercado por título
    if (market.title && MARKET_IMAGE_MAPPING[market.title]) {
      setImageSrc(MARKET_IMAGE_MAPPING[market.title]);
    } 
    // Si el mercado tiene una URL de imagen personalizada, la usamos
    else if (market.imageUrl) {
      setImageSrc(market.imageUrl);
    } 
    // Si no, usamos la imagen predeterminada para su categoría
    else {
      const category = market.category || 'default';
      setImageSrc(DEFAULT_IMAGES[category] || DEFAULT_IMAGES.default);
    }
  }, [market]);

  const handleImageError = () => {
    setImageError(true);
  };
  
  // Obtener el gradiente y el icono para la categoría
  const category = market.category || 'default';
  const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`} 
      style={{ height: `${height}px` }}
    >
      {imageSrc && !imageError ? (
        <>
          {/* Capa de fondo difuminada */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${imageSrc})`,
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
              opacity: 0.3
            }}
          />
          
          {/* Imagen principal */}
          <div 
            className="absolute inset-0 bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${imageSrc})` }}
          >
            {/* Esta sería la implementación real con Next/Image */}
            {/* <Image 
              src={imageSrc} 
              alt={market.title || 'Market image'} 
              fill
              style={{ objectFit: 'cover' }}
              onError={handleImageError}
            /> */}
          </div>
          
          {/* Overlay con gradiente para mejorar la legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-70"></div>
          
          {/* Indicador de categoría */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold bg-[#151520] text-[#00e5ff] border border-[#222]`}>
              {market.category ? market.category.charAt(0).toUpperCase() + market.category.slice(1) : 'General'}
            </span>
          </div>
        </>
      ) : showPlaceholder ? (
        // Placeholder con gradiente cuando no hay imagen o hay un error
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-6xl">{icon}</span>
          
          {/* Overlay con gradiente para dar profundidad */}
          <div className="absolute inset-0 bg-[#0a0a0a] opacity-40"></div>
          
          {/* Patrón de puntos para dar textura */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }}
          ></div>
          
          {/* Indicador de categoría */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-bold bg-[#151520] text-[#00e5ff] border border-[#222]`}>
              {market.category ? market.category.charAt(0).toUpperCase() + market.category.slice(1) : 'General'}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MarketImage;