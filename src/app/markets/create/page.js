// src/app/markets/create/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../../contexts/WalletContext';
import { mockBlockchain } from '../../../services/mockBlockchain';
import MarketImage from '../../../components/MarketImage';

export default function CreateMarket() {
  const router = useRouter();
  const { publicKey, connected, balance, connect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'crypto',
    endDate: '',
    initialLiquidity: 0,
    imageUrl: '', // URL de imagen personalizada
    resolutionType: 'manual' // Tipo de resolución (automatic o manual)
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const categories = [
    { id: 'crypto', name: 'Criptomonedas' },
    { id: 'sports', name: 'Deportes' },
    { id: 'politics', name: 'Política' },
    { id: 'entertainment', name: 'Entretenimiento' },
    { id: 'technology', name: 'Tecnología' },
    { id: 'other', name: 'Otros' }
  ];
  
  const predefinedImages = [
    { value: '', label: 'Seleccionar imagen predeterminada' },
    { value: '/images/markets/bitcoin-price.jpg', label: 'Criptomonedas - Bitcoin' },
    { value: '/images/markets/ethereum.jpg', label: 'Criptomonedas - Ethereum' },
    { value: '/images/markets/argentina-football.jpg', label: 'Deportes - Fútbol Argentina' },
    { value: '/images/markets/real-madrid.jpg', label: 'Deportes - Real Madrid' },
    { value: '/images/markets/spain-politics.jpg', label: 'Política - España' },
    { value: '/images/markets/harris.jpg', label: 'Política - Estados Unidos' },
    { value: '/images/markets/house-of-the-dragon.jpg', label: 'Entretenimiento - Series' },
    { value: '/images/markets/marvel.jpg', label: 'Entretenimiento - Películas' },
    { value: '/images/markets/apple-ar.jpg', label: 'Tecnología - Apple' },
    { value: '/images/markets/spacex-mars.jpg', label: 'Tecnología - SpaceX' },
    { value: '/images/markets/global-warming.jpg', label: 'Otros - Clima' },
    { value: '/images/markets/alien-life.jpg', label: 'Otros - Ciencia' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar el error de este campo si existe
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio';
    } else if (formData.title.length < 10) {
      errors.title = 'El título debe tener al menos 10 caracteres';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 20) {
      errors.description = 'La descripción debe tener al menos 20 caracteres';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'La fecha de finalización es obligatoria';
    } else {
      const selectedDate = new Date(formData.endDate);
      const now = new Date();
      
      if (selectedDate <= now) {
        errors.endDate = 'La fecha debe ser en el futuro';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const marketData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        endDate: new Date(formData.endDate).toISOString(),
        imageUrl: formData.imageUrl,
        resolutionType: formData.resolutionType
      };
      
      if (!connected) {
        // Mostrar mensaje de confirmación
        if (window.confirm('Para crear este mercado y ganar CHIPS por su actividad, necesitas conectar tu wallet. ¿Deseas conectarla ahora?')) {
          connect(); // Conectar wallet
          // Guardamos el formulario en localStorage para recuperarlo después
          localStorage.setItem('pendingMarket', JSON.stringify(marketData));
          return;
        } else {
          // Usuario quiere continuar sin conectar, usamos wallet anónima
          await mockBlockchain.wallets.initializeAnonymousWallet();
        }
      }
      
      // Si llegamos aquí, o bien el usuario está conectado o decidió continuar sin conectar
      const walletToUse = connected ? publicKey : 'guest-wallet';
      const newMarket = await mockBlockchain.markets.createMarket(walletToUse, marketData);
      
      // Redireccionar a la página del nuevo mercado
      router.push(`/markets/${newMarket.id}`);
    } catch (error) {
      console.error('Error al crear mercado:', error);
      setError('Error al crear el mercado. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{
      backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-[#00e5ff]">Crear un Nuevo Mercado Predictivo</h1>
        
        <div className="bg-gradient-to-r from-[#111520] to-[#0a0a0a] p-5 rounded-xl mb-6 border border-[#222]">
          <div className="flex items-center mb-4">
            <div className="bg-[#00e5ff] rounded-full p-2 text-black mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Crea tu propio mercado predictivo</h2>
              <p className="text-gray-400">Define una pregunta con resultado binario (Sí/No) y establece los términos.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-[#151515] rounded p-3 flex items-start border border-[#222222]">
              <span className="bg-[#102030] text-[#00e5ff] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <div>
                <p className="font-medium text-white">Define tu pregunta</p>
                <p className="text-gray-400">Debe ser clara y verificable objetivamente.</p>
              </div>
            </div>
            <div className="bg-[#151515] rounded p-3 flex items-start border border-[#222222]">
              <span className="bg-[#102030] text-[#00e5ff] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <div>
                <p className="font-medium text-white">Establece la fecha límite</p>
                <p className="text-gray-400">Cuándo se cerrará el mercado a nuevas apuestas.</p>
              </div>
            </div>
            <div className="bg-[#151515] rounded p-3 flex items-start border border-[#222222]">
              <span className="bg-[#102030] text-[#00e5ff] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <div>
                <p className="font-medium text-white">Abre el mercado</p>
                <p className="text-gray-400">¡Y empieza a recibir apuestas de otros usuarios!</p>
              </div>
            </div>
          </div>
        </div>
        
        {!connected && (
          <div className="mb-6 p-4 bg-[#151515] border-l-4 border-[#ffcc00] text-[#ffcc00] rounded">
            <p className="font-medium">Puedes crear un mercado sin conectar tu wallet, pero conectándola ganarás CHIPS por la actividad en tu mercado.</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-[#151515] border-l-4 border-[#ff3366] text-[#ff3366] rounded">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-[#151515] rounded-lg p-6 border border-[#222]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                  Título del Mercado
                </label>
                <input
                  className={`shadow appearance-none border ${formErrors.title ? 'border-[#ff3366]' : 'border-[#222]'} bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]`}
                  id="title"
                  name="title"
                  type="text"
                  placeholder="¿Bitcoin superará los $100k antes de fin de año?"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {formErrors.title && (
                  <p className="text-[#ff3366] text-xs italic mt-1">{formErrors.title}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  className={`shadow appearance-none border ${formErrors.description ? 'border-[#ff3366]' : 'border-[#222]'} bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]`}
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Describe los detalles y condiciones del mercado..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                ></textarea>
                {formErrors.description && (
                  <p className="text-[#ff3366] text-xs italic mt-1">{formErrors.description}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="category">
                  Categoría
                </label>
                <select
                  className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="endDate">
                  Fecha de Finalización
                </label>
                <input
                  className={`shadow appearance-none border ${formErrors.endDate ? 'border-[#ff3366]' : 'border-[#222]'} bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]`}
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {formErrors.endDate && (
                  <p className="text-[#ff3366] text-xs italic mt-1">{formErrors.endDate}</p>
                )}
              </div>
            </div>
            
            <div>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Imagen del Mercado
                </label>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="mb-3">
                      <select
                        className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        disabled={isLoading}
                      >
                        {predefinedImages.map(img => (
                          <option key={img.value} value={img.value}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecciona una imagen predeterminada para tu mercado
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <input
                        className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                        type="text"
                        placeholder="URL de imagen personalizada"
                        value={formData.customImageUrl || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData({
                            ...formData, 
                            imageUrl: url,
                            customImageUrl: url
                          });
                        }}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Introduce la URL de una imagen personalizada</p>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-gray-300 text-sm font-bold mb-2">
                        Tipo de Resolución
                      </label>
                      <div className="flex">
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-l text-sm transition-all border ${
                            formData.resolutionType === 'automatic'
                              ? 'bg-[#00e5ff] text-black border-[#00e5ff]'
                              : 'bg-[#101010] text-gray-300 border-[#222] hover:bg-[#151515]'
                          }`}
                          onClick={() => setFormData({ ...formData, resolutionType: 'automatic' })}
                          disabled={isLoading}
                        >
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                            Automática
                          </div>
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-r text-sm transition-all border ${
                            formData.resolutionType === 'manual'
                              ? 'bg-[#9945FF] text-white border-[#9945FF]'
                              : 'bg-[#101010] text-gray-300 border-[#222] hover:bg-[#151515]'
                          }`}
                          onClick={() => setFormData({ ...formData, resolutionType: 'manual' })}
                          disabled={isLoading}
                        >
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            Manual Verificada
                          </div>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.resolutionType === 'automatic' ? 
                          'La resolución se determinará automáticamente mediante oráculos o fuentes de datos externas' : 
                          'La resolución se llevará a cabo por moderadores verificados o consenso comunitario'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#101010] border border-[#222] rounded-lg overflow-hidden mt-4">
                    <h4 className="text-sm font-medium p-3 border-b border-[#222]">Vista previa</h4>
                    <div className="p-3">
                      {formData.title || formData.category ? (
                        <div>
                          <MarketImage 
                            market={{
                              title: formData.title || 'Título del mercado',
                              category: formData.category,
                              imageUrl: formData.imageUrl
                            }} 
                            height={180}
                          />
                          <p className="text-xs text-center text-gray-500 mt-2">
                            {formData.imageUrl ? 'Imagen personalizada' : 'Imagen predeterminada para la categoría seleccionada'}
                          </p>
                        </div>
                      ) : (
                        <div className="h-40 bg-[#0a0a0a] rounded flex items-center justify-center">
                          <p className="text-gray-500">Completa los campos para ver la vista previa</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button
              className="bg-[#00e5ff] hover:bg-[#00b8cc] text-black font-bold py-2 px-6 rounded-md shadow focus:outline-none transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Mercado'}
            </button>
            <button
              className="bg-[#222] hover:bg-[#333] text-gray-300 font-bold py-2 px-4 rounded-md shadow focus:outline-none transition-all"
              type="button"
              onClick={() => router.push('/')}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}