// src/contexts/WalletContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { mockBlockchain } from '../services/mockBlockchain';

// Tipo de wallet simulado mientras implementamos Phantom
const WALLET_TYPE = {
  MOCK: 'mock',
  PHANTOM: 'phantom',
  NONE: 'none'
};

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [walletType, setWalletType] = useState(WALLET_TYPE.NONE);
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(false);

  // Comprobar si Phantom está disponible
  useEffect(() => {
    const checkWallet = async () => {
      const isPhantomAvailable = window && window.solana && window.solana.isPhantom;
      setWalletAvailable(isPhantomAvailable);
    };

    // En el navegador, comprueba si Phantom está disponible
    if (typeof window !== 'undefined') {
      checkWallet();
    }
  }, []);

  // Función para actualizar el saldo
  const updateBalance = async () => {
    if (!publicKey) return;

    try {
      const newBalance = await mockBlockchain.wallets.getBalance(publicKey);
      setBalance(newBalance);
    } catch (error) {
      console.error("Error al actualizar saldo:", error);
    }
  };

  // Conectar con Phantom o wallet simulada
  const connect = async () => {
    setLoading(true);
    
    try {
      if (walletAvailable) {
        // Intenta conectar con Phantom si está disponible
        try {
          // Solicitar conexión con Phantom
          const resp = await window.solana.connect();
          const phantomPublicKey = resp.publicKey.toString();
          
          // Inicializar wallet para simulación (en futuro, esto se reemplazaría)
          await mockBlockchain.wallets.initWallet(phantomPublicKey);
          
          // Actualizar estado
          setPublicKey(phantomPublicKey);
          setConnected(true);
          setWalletType(WALLET_TYPE.PHANTOM);
          
          // Obtener saldo
          const newBalance = await mockBlockchain.wallets.getBalance(phantomPublicKey);
          setBalance(newBalance);
          
          return true;
        } catch (error) {
          console.error("Error al conectar con Phantom:", error);
          // Si falla Phantom, usamos wallet simulada
          await useSimulatedWallet();
        }
      } else {
        // Si no hay Phantom, usamos wallet simulada
        await useSimulatedWallet();
      }
    } catch (error) {
      console.error("Error al conectar wallet:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para usar wallet simulada
  const useSimulatedWallet = async () => {
    // Crear una dirección pública simulada
    const mockPublicKey = `wallet-${Math.random().toString(36).substring(2, 15)}`;
    
    // Inicializar wallet simulada
    await mockBlockchain.wallets.initWallet(mockPublicKey);
    
    // Actualizar estado
    setPublicKey(mockPublicKey);
    setConnected(true);
    setWalletType(WALLET_TYPE.MOCK);
    
    // Obtener saldo
    const newBalance = await mockBlockchain.wallets.getBalance(mockPublicKey);
    setBalance(newBalance);
    
    return true;
  };

  // Desconectar wallet
  const disconnect = () => {
    if (walletType === WALLET_TYPE.PHANTOM && window.solana) {
      window.solana.disconnect();
    }
    
    setPublicKey('');
    setBalance(0);
    setConnected(false);
    setWalletType(WALLET_TYPE.NONE);
  };

  // Recargar CHIPS (función simulada)
  const addChips = async (amount) => {
    if (!connected) return false;
    
    try {
      // Añadir CHIPS (simulado)
      const currentBalance = await mockBlockchain.wallets.getBalance(publicKey);
      const wallet = mockBlockchain.storage.wallets[publicKey];
      wallet.balance = currentBalance + amount;
      
      // Actualizar balance en el estado
      setBalance(wallet.balance);
      
      return true;
    } catch (error) {
      console.error("Error al añadir CHIPS:", error);
      return false;
    }
  };

  // Valores del contexto
  const value = {
    publicKey,
    connected,
    balance,
    loading,
    walletAvailable,
    walletType,
    connect,
    disconnect,
    updateBalance,
    addChips
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};