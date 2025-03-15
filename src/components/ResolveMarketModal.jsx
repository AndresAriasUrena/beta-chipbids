// src/components/ResolveMarketModal.jsx
"use client";

import { useState } from 'react';
import { mockBlockchain } from '../services/mockBlockchain';

const ResolveMarketModal = ({ 
  market, 
  isOpen, 
  onClose, 
  onResolved 
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('manual');
  const [verificationSource, setVerificationSource] = useState('');
  const [verificationDetails, setVerificationDetails] = useState('');

  if (!isOpen) return null;

  const handleResolveMarket = async () => {
    if (!selectedOption) return;
    
    setIsProcessing(true);
    
    try {
      // En un entorno real, aquí habría una llamada a la blockchain
      // Simulamos con mockBlockchain
      await mockBlockchain.markets.resolveMarket(
        market.id, 
        selectedOption,
        {
          method: verificationMethod,
          source: verificationSource,
          details: verificationDetails,
          resolvedAt: new Date().toISOString()
        }
      );
      
      // Notificar al componente padre
      if (onResolved) {
        onResolved(selectedOption);
      }
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error("Error al resolver mercado:", error);
      alert("Error al resolver el mercado: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#151515] rounded-lg p-6 max-w-xl w-full border border-[#222] animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Resolver Mercado</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-[#101010] p-4 rounded mb-6 border border-[#222]">
          <p className="text-lg font-medium text-white mb-2">{market.title}</p>
          <p className="text-sm text-gray-400">{market.description}</p>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-3">Selecciona el resultado correcto:</p>
          
          <div className="flex space-x-4">
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all border ${
                selectedOption === 'yes'
                  ? 'bg-[#00ff88] text-black border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                  : 'bg-[#101010] text-gray-300 border-[#222] hover:bg-[#151515]'
              }`}
              onClick={() => setSelectedOption('yes')}
            >
              SÍ
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all border ${
                selectedOption === 'no'
                  ? 'bg-[#ff3366] text-white border-[#ff3366] shadow-[0_0_10px_rgba(255,51,102,0.3)]'
                  : 'bg-[#101010] text-gray-300 border-[#222] hover:bg-[#151515]'
              }`}
              onClick={() => setSelectedOption('no')}
            >
              NO
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-3">Método de verificación:</p>
          
          <div className="flex mb-4">
            <button
              className={`flex-1 py-2 px-3 rounded-l font-medium transition-all border ${
                verificationMethod === 'automatic'
                  ? 'bg-[#00e5ff] text-black border-[#00e5ff]'
                  : 'bg-[#101010] text-gray-300 border-[#222] hover:bg-[#151515]'
              }`}
              onClick={() => setVerificationMethod('automatic')}
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
                Automático
              </div>
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-r font-medium transition-all border ${
                verificationMethod === 'manual'
                  ? 'bg-[#9945FF] text-white border-[#9945FF]'
                  : 'bg-[#101010] text-gray-300 border-[#222] hover:bg-[#151515]'
              }`}
              onClick={() => setVerificationMethod('manual')}
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Manual Verificado
              </div>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Fuente de verificación
              </label>
              <input
                className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                type="text"
                placeholder={verificationMethod === 'automatic' ? "API, Oracle, Feed de datos..." : "URL, Comunicado oficial..."}
                value={verificationSource}
                onChange={(e) => setVerificationSource(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Detalles adicionales (opcional)
              </label>
              <textarea
                className="shadow appearance-none border border-[#222] bg-[#0a0a0a] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-[#00e5ff]"
                rows="3"
                placeholder="Explica brevemente cómo se verificó el resultado..."
                value={verificationDetails}
                onChange={(e) => setVerificationDetails(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between space-x-4">
          <button
            className="px-4 py-2 border border-[#222] rounded-md text-gray-300 hover:bg-[#222] transition-colors"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          
          <button
            className={`px-6 py-2 bg-[#00e5ff] text-black rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              !isProcessing && selectedOption 
                ? 'hover:bg-[#00b8cc] hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                : ''
            }`}
            onClick={handleResolveMarket}
            disabled={isProcessing || !selectedOption}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </div>
            ) : (
              'Confirmar y Resolver'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolveMarketModal;