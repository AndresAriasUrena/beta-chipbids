// src/app/markets/create/page.js - Actualizar la página completa

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../../contexts/WalletContext';
import { mockBlockchain } from '../../../services/mockBlockchain';

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
    initialLiquidity: 0
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
        endDate: new Date(formData.endDate).toISOString()
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
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-6 text-[#00e5ff]">Crear un Nuevo Mercado Predictivo</h1>
      
      <div className="bg-gradient-to-r from-[#111520] to-[#0a0a0a] rounded-lg p-6 mb-6 border border-[#222]">
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
  );
}