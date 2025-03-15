// src/components/MarketImage.jsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Imágenes predeterminadas por categoría
const DEFAULT_IMAGES = {
  crypto: '/images/categories/crypto.jpg',
  sports: '/images/categories/sports.jpg',
  politics: '/images/categories/politics.jpg',
  entertainment: '/images/categories/entertainment.jpg',
  technology: '/images/categories/technology.jpg',
  other: '/images/categories/other.jpg',
  default: '/images/categories/default.jpg'
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
    // Si el mercado tiene una imagen personalizada, la usamos
    if (market.imageUrl) {
      setImageSrc(market.imageUrl);
    } else {
      // Si no, usamos la imagen predeterminada para su categoría
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
          {/* Simular una imagen Next/Image con un div de fondo para la demo */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${imageSrc})`,
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
              opacity: 0.3
            }}
          />
          
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