// src/components/CategoryBanners.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CategoryBanners = () => {
  const router = useRouter();
  
  // Datos de las categorías
  const categories = [
    {
      id: 'crypto',
      name: 'Criptomonedas',
      description: 'Predice el futuro de Bitcoin, Ethereum y más',
      image: '/images/categories/crypto.png',
      color: '#00e5ff',
      markets: 12,
      volume: '2,500+',
      tag: 'Popular'
    },
    {
      id: 'sports',
      name: 'Deportes',
      description: 'Apuesta en fútbol, baloncesto y más',
      image: '/images/categories/sports.png',
      color: '#00ff88',
      markets: 15,
      volume: '8,000+',
      tag: 'Tendencia'
    },
    {
      id: 'politics',
      name: 'Política',
      description: 'Elecciones, acontecimientos políticos y más',
      image: '/images/categories/politics.png',
      color: '#ff3366',
      markets: 8,
      volume: '4,300+'
    },
    {
      id: 'technology',
      name: 'Tecnología',
      description: 'Lanzamientos de productos, innovaciones y más',
      image: '/images/categories/technology.png',
      color: '#00e5ff',
      markets: 10,
      volume: '3,800+'
    },
    {
      id: 'entertainment',
      name: 'Entretenimiento',
      description: 'Cine, TV, premios y eventos culturales',
      image: '/images/categories/entertainment.png',
      color: '#9945FF',
      markets: 9,
      volume: '2,100+'
    },
    {
      id: 'other',
      name: 'Otros',
      description: 'Clima, ciencia, descubrimientos y más',
      image: '/images/categories/other.png',
      color: '#ffcc00',
      markets: 6,
      volume: '1,800+'
    }
  ];
  
  // Navegar a la página de categoría cuando se hace clic
  const handleCategoryClick = (categoryId) => {
    router.push(`/categories/${categoryId}`);
  };
  
  // Para el carrusel 
  const scrollLeft = () => {
    document.getElementById('categories-container').scrollBy({ left: -300, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    document.getElementById('categories-container').scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="mb-10 mt-4">
      {/* Encabezado de la sección */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Explora Categorías</h2>
        <div className="flex space-x-2">
          <button 
            onClick={scrollLeft}
            className="bg-[#151515] hover:bg-[#202020] text-white rounded-full p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="bg-[#151515] hover:bg-[#202020] text-white rounded-full p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Grid de banners con capacidad de scroll horizontal en móvil */}
      <div 
        id="categories-container"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:overflow-visible overflow-x-auto flex-nowrap md:flex-wrap snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <div 
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="group relative rounded-xl overflow-hidden cursor-pointer h-48 transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] snap-start min-w-[300px] md:min-w-0"
          >
            {/* Contenedor de la imagen con efecto de zoom */}
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-3000 ease-in-out group-hover:scale-110"
              />
            </div>
            
            {/* Gradiente oscuro sobre la imagen */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80 group-hover:from-black/20 group-hover:via-black/40 group-hover:to-black/90 transition-all duration-500"></div>
            
            {/* Contenido del banner */}
            <div className="absolute bottom-0 left-0 p-4 w-full transform transition-transform duration-500 group-hover:translate-y-[-5px]">
              <h3 
                className="text-xl font-bold text-white mb-1 transition-colors duration-300"
                style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }} 
              >
                {category.name}
              </h3>
              
              <p className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">{category.description}</p>
              
              <div className="flex items-center mt-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                <span 
                  className="text-black text-xs font-bold px-2 py-1 rounded transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: category.color }}
                >
                  {category.markets} mercados
                </span>
                <span className="ml-2 text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-300">{category.volume} CHIPS apostados</span>
              </div>
            </div>
            
            {/* Etiqueta de categoría */}
            {category.tag && (
              <div className="absolute top-0 right-0 p-3 transform transition-transform duration-500 group-hover:translate-y-1 group-hover:translate-x-1">
                <span 
                  className="bg-black bg-opacity-50 text-xs font-bold px-2 py-1 rounded transition-all duration-300 group-hover:bg-opacity-70"
                  style={{ color: category.color }}
                >
                  {category.tag}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBanners;