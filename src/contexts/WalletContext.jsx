import React, { createContext, useState, useEffect, useContext } from 'react';
import { mockBlockchain } from '../services/mockBlockchain';

// Crear el contexto
export const WalletContext = createContext();

// Proveedor del contexto
export const WalletProvider = ({ children }) => {
  const [publicKey, setPublicKey] = useState(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Conectar simulando wallet
  const connect = async () => {
    try {
      setLoading(true);
      
      // Generar una dirección simulada
      const simulatedAddress = `simulated-${Math.random().toString(36).substring(2, 10)}`;
      
      // Inicializar la wallet en la simulación
      await mockBlockchain.wallets.initWallet(simulatedAddress);
      
      // Establecer la conexión simulada
      setPublicKey(simulatedAddress);
      setConnected(true);
      
      // Actualizar el saldo
      const balance = await mockBlockchain.wallets.getBalance(simulatedAddress);
      setBalance(balance);
    } catch (error) {
      console.error("Error en la simulación de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  // Desconectar
  const disconnect = () => {
    setPublicKey(null);
    setConnected(false);
    setBalance(0);
  };

  // Actualizar el saldo
  const updateBalance = async () => {
    if (publicKey) {
      const balance = await mockBlockchain.wallets.getBalance(publicKey);
      setBalance(balance);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        balance,
        loading,
        connect,
        disconnect,
        updateBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useWallet = () => useContext(WalletContext);

export default WalletProvider;