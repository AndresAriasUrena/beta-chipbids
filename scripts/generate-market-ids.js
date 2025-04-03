// scripts/generate-market-ids.js
// Script para extraer IDs de mercados y generar la función generateStaticParams

const { mockBlockchain } = require('../src/services/mockBlockchain');

// Función principal
async function generateMarketIds() {
  try {
    // Inicializar mercados predeterminados
    await mockBlockchain.initializeDefaultMarkets();
    
    // Obtener todos los mercados
    const markets = await mockBlockchain.markets.getAllMarkets();
    
    // Extraer los IDs
    const marketIds = markets.map(market => ({ id: market.id }));
    
    // Generar el código para generateStaticParams
    const staticParamsCode = `export async function generateStaticParams() {
  // Generado automáticamente a partir de los mercados disponibles
  return ${JSON.stringify(marketIds, null, 2)};
}`;
    
    console.log('// Copia y pega esta función en tu archivo /markets/[id]/page.jsx:');
    console.log(staticParamsCode);
    
    console.log('\n// IDs de mercados disponibles:');
    marketIds.forEach(({ id }) => console.log(`- ${id}`));
    
    return marketIds;
  } catch (error) {
    console.error('Error generando IDs de mercados:', error);
    return [];
  }
}

// Ejecutar la función
generateMarketIds();