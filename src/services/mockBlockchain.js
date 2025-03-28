import { v4 as uuidv4 } from 'uuid';

// Almacenamiento en memoria para simular la blockchain
const storage = {
  markets: [],
  bets: [],
  wallets: {},
  transactions: []
};

// Añadir cuenta anónima para usuarios no conectados
const ANONYMOUS_WALLET = "guest-wallet";

// Simula un retraso de red para hacer la experiencia más realista
const simulateNetworkDelay = async () => {
  return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
};

export const mockBlockchain = {
  // Operaciones básicas para mercados
  markets: {
    // Obtener todos los mercados
    getAllMarkets: async () => {
        await simulateNetworkDelay();
        return [...storage.markets];
      },
    
    // Crear un nuevo mercado
    createMarket: async (walletAddress = ANONYMOUS_WALLET, marketData) => {
        await simulateNetworkDelay();
        
        const newMarket = {
          id: uuidv4(),
          creator: walletAddress,
          createdAt: new Date().toISOString(),
          status: 'open',
          yesPool: 0,
          noPool: 0,
          totalBets: 0,
          resolvedOption: null,
          resolvedAt: null,
          resolutionType: marketData.resolutionType || 'manual', // 'automatic' o 'manual'
          resolutionDetails: null,
          ...marketData
        };
      
      storage.markets.push(newMarket);
      return newMarket;
    },
    
    // Resolver un mercado
    resolveMarket: async (marketId, result, verificationData = {}) => {
      await simulateNetworkDelay();
      
      // Buscar mercado
      const marketIndex = storage.markets.findIndex(m => m.id === marketId);
      if (marketIndex === -1) {
        throw new Error('Mercado no encontrado');
      }
      
      const market = storage.markets[marketIndex];
      
      // Verificar que el mercado está abierto
      if (market.status !== 'open') {
        throw new Error('El mercado ya ha sido resuelto o está cerrado');
      }
      
      // Actualizar el mercado con el resultado
      market.resolvedOption = result;
      market.resolvedAt = new Date().toISOString();
      market.status = 'resolved';
      market.resolutionDetails = verificationData;
      
      // Pagar a los ganadores (simulado)
      // Obtener todas las apuestas para este mercado
      const marketBets = storage.bets.filter(bet => bet.marketId === marketId);
      
      // Determinar la cantidad total de fichas apostadas y la cantidad apostada a la opción ganadora
      const totalPool = market.yesPool + market.noPool;
      const winningPool = result === 'yes' ? market.yesPool : market.noPool;
      
      // Si no hay apuestas ganadoras, no hacemos nada
      if (winningPool <= 0) {
        storage.markets[marketIndex] = market;
        return market;
      }
      
      // Distribuir las ganancias a las apuestas ganadoras
      marketBets.forEach(bet => {
        if (bet.option === result) {
          // Calcular las ganancias: (apuesta / total_apuestas_ganadoras) * total_pool
          const winnings = (bet.amount / winningPool) * totalPool * 0.98; // Con comisión del 2%
          
          // Pagar al ganador
          const wallet = storage.wallets[bet.walletAddress];
          if (wallet) {
            wallet.balance += winnings;
          }
        }
      });
      
      // Guardar cambios
      storage.markets[marketIndex] = market;
      
      return market;
    }
  },

  // Inicializar billetera anónima al cargar la aplicación
  initializeAnonymousWallet: async () => {
      if (!storage.wallets[ANONYMOUS_WALLET]) {
        storage.wallets[ANONYMOUS_WALLET] = {
          address: ANONYMOUS_WALLET,
          balance: 500, // Saldo inicial para pruebas
          createdAt: new Date().toISOString()
        };
      }
      return storage.wallets[ANONYMOUS_WALLET];
    },
    
  // Inicializar una billetera con saldo de prueba
  wallets: {
    initWallet: async (walletAddress) => {
      if (!storage.wallets[walletAddress]) {
        storage.wallets[walletAddress] = {
          address: walletAddress,
          balance: 1000, // Saldo inicial ficticio
          createdAt: new Date().toISOString()
        };
      }
      
      return storage.wallets[walletAddress];
    },
    
    // Obtener saldo de billetera
    getBalance: async (walletAddress) => {
      await simulateNetworkDelay();
      
      const wallet = storage.wallets[walletAddress] || { balance: 0 };
      return wallet.balance;
    }
  },
  initializeDefaultMarkets: async () => {
    // Verificar si ya hay mercados para evitar duplicados
    const existingMarkets = await mockBlockchain.markets.getAllMarkets();
    if (existingMarkets.length > 0) {
      return existingMarkets;
    }
  
    // Datos para los mercados de ejemplo
    const defaultMarkets = [
      // Criptomonedas
      {
        title: "¿Bitcoin superará los $100,000 antes de fin de año?",
        description: "El precio de Bitcoin (BTC) debe alcanzar o superar los $100,000 USD en cualquier exchange principal como Binance, Coinbase o Kraken durante al menos 1 hora antes del 31 de diciembre de 2025.",
        category: "crypto",
        country: null,  // Global - no tiene país específico
        imageUrl: "/images/markets/bitcoin-price2.png", // Imagen específica
        endDate: new Date(2025, 11, 31).toISOString(),
        yesPool: 3250,
        noPool: 1850,
        totalBets: 87,
        status: "open"
      },
      {
        title: "¿Ethereum tendrá más de 500,000 validadores antes de julio?",
        description: "La red Ethereum debe alcanzar o superar los 500,000 validadores activos en la blockchain oficial según etherscan.io antes del 1 de julio de 2025.",
        category: "crypto",
        imageUrl: "/images/markets/ethereum.png", // Imagen específica
        endDate: new Date(2025, 6, 1).toISOString(),
        yesPool: 1875,
        noPool: 2340,
        totalBets: 64,
        status: "open"
      },
  
      // Deportes
      {
        title: "¿Ganará Argentina la Copa América 2025?",
        description: "Argentina debe ser declarada campeona oficial de la Copa América 2025 por la CONMEBOL. El mercado se resolverá después de la final del torneo.",
        category: "sports",
        country: "AR",  // Añadido
        imageUrl: "/images/markets/argentina...otball.png", // Imagen específica
        endDate: new Date(2025, 7, 15).toISOString(),
        yesPool: 4200,
        noPool: 3800,
        totalBets: 156,
        status: "open"
      },
      {
        title: "¿Real Madrid ganará la Champions League 2025-2026?",
        description: "El Real Madrid debe ser declarado campeón oficial de la UEFA Champions League 2025-2026. El mercado se resolverá tras la final.",
        category: "sports",
        country: "ES",  // Añadido
        imageUrl: "/images/markets/real-madrid.png", // Imagen específica
        endDate: new Date(2026, 5, 30).toISOString(),
        yesPool: 2800,
        noPool: 3100,
        totalBets: 92,
        status: "open"
      },
  
      // Política
      {
        title: "¿Se celebrarán elecciones anticipadas en España antes de octubre 2025?",
        description: "Debe anunciarse y celebrarse oficialmente una elección general española antes del 1 de octubre de 2025.",
        category: "politics",
        country: "ES",  // Añadido
        imageUrl: "/images/markets/spain-politics.png", // Imagen específica
        endDate: new Date(2025, 9, 1).toISOString(),
        yesPool: 1250,
        noPool: 3650,
        totalBets: 78,
        status: "open"
      },
      {
        title: "¿Kamala Harris se presentará como candidata en 2028?",
        description: "Kamala Harris debe anunciar oficialmente su candidatura para las elecciones presidenciales de Estados Unidos de 2028.",
        category: "politics",
        country: "US",  // Añadido
        imageUrl: "/images/markets/harris.png", // Imagen específica
        endDate: new Date(2027, 11, 31).toISOString(),
        yesPool: 2950,
        noPool: 1870,
        totalBets: 96,
        status: "open"
      },
  
      // Entretenimiento
      {
        title: "¿La nueva temporada de House of the Dragon superará los 15 millones de espectadores?",
        description: "El estreno de la nueva temporada de House of the Dragon debe alcanzar o superar los 15 millones de espectadores globales según las cifras oficiales de HBO/Warner.",
        category: "entertainment",
        country: "US",  // Añadido
        imageUrl: "/images/markets/house-of-...ragon.png", // Imagen específica
        endDate: new Date(2025, 7, 1).toISOString(),
        yesPool: 1780,
        noPool: 920,
        totalBets: 56,
        status: "open"
      },
      {
        title: "¿La próxima película de Marvel superará los $1,000 millones en taquilla?",
        description: "La próxima película del Universo Cinematográfico de Marvel debe recaudar más de $1,000 millones USD globalmente según Box Office Mojo.",
        category: "entertainment",
        imageUrl: "/images/markets/marvel.png", // Imagen específica
        endDate: new Date(2025, 11, 31).toISOString(),
        yesPool: 1450,
        noPool: 2180,
        totalBets: 67,
        status: "open"
      },
  
      // Tecnología
      {
        title: "¿Apple lanzará sus gafas de realidad aumentada antes de septiembre?",
        description: "Apple debe anunciar y comenzar a vender oficialmente unas gafas/dispositivo de realidad aumentada (no VR) antes del 1 de septiembre de 2025.",
        category: "technology",
        country: "US",  // Añadido
        imageUrl: "/images/markets/apple-ar.png", // Imagen específica
        endDate: new Date(2025, 8, 1).toISOString(),
        yesPool: 2150,
        noPool: 3280,
        totalBets: 87,
        status: "open"
      },
      {
        title: "¿SpaceX completará el primer aterrizaje tripulado en Marte antes de 2030?",
        description: "SpaceX debe completar con éxito una misión tripulada a Marte con al menos un aterrizaje y posterior despegue seguro antes del 1 de enero de 2030.",
        category: "technology",
        country: "US",  // Añadido
        imageUrl: "/images/markets/spacex-mars.png", // Imagen específica
        endDate: new Date(2029, 11, 31).toISOString(),
        yesPool: 1840,
        noPool: 4120,
        totalBets: 104,
        status: "open"
      },
  
      // Otros
      {
        title: "¿La temperatura global promedio de 2025 será la más alta registrada?",
        description: "El año 2025 debe ser declarado oficialmente por la NASA o la NOAA como el año con la temperatura global promedio más alta jamás registrada.",
        category: "other",
        country: null,  // Global - no tiene país específico
        imageUrl: "/images/markets/global-warming.png", // Imagen específica
        endDate: new Date(2026, 1, 15).toISOString(),
        yesPool: 3760,
        noPool: 1230,
        totalBets: 82,
        status: "open"
      },
      {
        title: "¿Se descubrirá evidencia concluyente de vida extraterrestre antes de 2027?",
        description: "Una agencia gubernamental, institución científica o universidad reconocida debe anunciar el descubrimiento de evidencia concluyente (no ambigua) de vida extraterrestre antes del 1 de enero de 2027.",
        category: "other",
        country: null,  // Global - no tiene país específico
        imageUrl: "/images/markets/alien-life.png", // Imagen específica
        endDate: new Date(2026, 11, 31).toISOString(),
        yesPool: 890,
        noPool: 4560,
        totalBets: 76,
        status: "open"
      }
    ];
  
    // Crear cada mercado con información adicional
    const now = new Date();
    const createdMarkets = await Promise.all(
      defaultMarkets.map(async (market) => {
        // Crear un ID de billetera simulado para el creador
        const creatorAddress = `wallet-${Math.random().toString(36).substring(2, 10)}`;
        
        // Inicializar la billetera del creador
        await mockBlockchain.wallets.initWallet(creatorAddress);
        
        // Calcular fecha de creación aleatoria en los últimos 30 días
        const randomDays = Math.floor(Math.random() * 30);
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - randomDays);
        
        return mockBlockchain.markets.createMarket(
          creatorAddress, 
          {
            ...market,
            createdAt: createdAt.toISOString()
          }
        );
      })
    );
  
    return createdMarkets;
  }
};
mockBlockchain.bets = {
  // Realizar una apuesta
  placeBet: async (walletAddress, marketId, option, amount) => {
    await simulateNetworkDelay();
    
    // Verificar que el mercado existe
    const marketIndex = storage.markets.findIndex(m => m.id === marketId);
    if (marketIndex === -1) {
      throw new Error('Mercado no encontrado');
    }
    
    const market = storage.markets[marketIndex];
    
    // Verificar que el mercado está abierto
    if (market.status !== 'open') {
      throw new Error('El mercado no está abierto para apuestas');
    }
    
    // Verificar saldo suficiente
    const wallet = storage.wallets[walletAddress];
    if (!wallet || wallet.balance < amount) {
      throw new Error('Saldo insuficiente');
    }
    
    // Registrar la apuesta
    const bet = {
      id: uuidv4(),
      walletAddress,
      marketId,
      option,
      amount,
      timestamp: new Date().toISOString()
    };
    
    // Actualizar el saldo de la billetera
    wallet.balance -= amount;
    
    // Actualizar el mercado
    if (option === 'yes') {
      market.yesPool += amount;
    } else {
      market.noPool += amount;
    }
    market.totalBets += 1;
    
    // Guardar la apuesta
    storage.bets.push(bet);
    
    // Actualizar el mercado en el storage
    storage.markets[marketIndex] = market;
    
    return { bet, market };
  },
  
  // Obtener historial de apuestas por wallet
  getBetsByWallet: async (walletAddress) => {
    await simulateNetworkDelay();
    return storage.bets.filter(bet => bet.walletAddress === walletAddress);
  }
};

export default mockBlockchain;