// src/app/markets/[id]/generateStaticParams.js
import { mockBlockchain } from '../../../services/mockBlockchain';

export async function generateStaticParams() {
  const markets = await mockBlockchain.markets.getAllMarkets();
  return markets.map((market) => ({
    id: market.id,
  }));
}
