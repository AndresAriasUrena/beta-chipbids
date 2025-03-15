// src/components/MarketSummaryAI.jsx
"use client";

import { useState } from 'react';

const MarketSummaryAI = ({ market }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showFullSummary, setShowFullSummary] = useState(false);

  // Función para generar análisis de mercado basado en los datos del mercado
  const generateMarketSummary = async () => {
    setIsGenerating(true);
    setSummary(null);
    
    // Simulamos una llamada a API con un pequeño retraso
    setTimeout(() => {
      // Generamos un resumen basado en los datos del mercado
      const yesPercentage = market.yesPool 
        ? Math.round((market.yesPool / (market.yesPool + market.noPool)) * 100) 
        : 50;
      const noPercentage = 100 - yesPercentage;
      
      // Obtenemos la fecha de fin y calculamos días restantes
      const endDate = new Date(market.endDate);
      const currentDate = new Date();
      const daysRemaining = Math.round((endDate - currentDate) / (1000 * 60 * 60 * 24));
      
      // Determinar tendencia (último 20% del tiempo vs primeros 80%)
      let trendDirection = '';
      const randomTrend = Math.random();
      if (yesPercentage > 65) {
        trendDirection = randomTrend > 0.3 ? 'alcista' : 'estable con tendencia alcista';
      } else if (yesPercentage < 35) {
        trendDirection = randomTrend > 0.3 ? 'bajista' : 'estable con tendencia bajista';
      } else if (yesPercentage >= 45 && yesPercentage <= 55) {
        trendDirection = 'altamente disputado sin clara dirección';
      } else {
        trendDirection = randomTrend > 0.5 ? 'ligeramente alcista' : 'ligeramente bajista';
      }
      
      // Evaluación de liquidez
      const totalLiquidity = (market.yesPool || 0) + (market.noPool || 0);
      let liquidityAssessment = '';
      if (totalLiquidity > 5000) {
        liquidityAssessment = 'alta liquidez';
      } else if (totalLiquidity > 1000) {
        liquidityAssessment = 'liquidez moderada';
      } else {
        liquidityAssessment = 'baja liquidez';
      }
      
      // Nivel de actividad
      const activityLevel = market.totalBets > 50 ? 'alta' : market.totalBets > 20 ? 'moderada' : 'baja';
      
      // Momento óptimo para entrar
      let entryRecommendation = '';
      if (daysRemaining < 3) {
        entryRecommendation = 'Este mercado está cerca de su resolución, lo que aumenta la volatilidad. Considere los riesgos antes de entrar.';
      } else if (Math.abs(yesPercentage - 50) < 10) {
        entryRecommendation = 'Con las probabilidades cerca del 50%, ahora podría ser un buen momento para tomar posición en cualquier dirección si tiene información privilegiada.';
      } else if (yesPercentage > 75 || yesPercentage < 25) {
        entryRecommendation = 'El mercado muestra una fuerte confianza en un resultado. Considere la posibilidad de apostar en contra solo si tiene fuertes razones para creer que el consenso está equivocado.';
      } else {
        entryRecommendation = 'La distribución actual de apuestas sugiere que hay oportunidades en ambas direcciones dependiendo de su análisis.';
      }
      
      // Construir el resumen
      const generatedSummary = {
        shortSummary: `Este mercado muestra una tendencia ${trendDirection} con ${liquidityAssessment} y actividad ${activityLevel}. Actualmente, las probabilidades favorecen "${yesPercentage > 50 ? 'Sí' : 'No'}" con un ${Math.max(yesPercentage, noPercentage)}% de confianza.`,
        
        fullAnalysis: `
# Análisis de mercado para: "${market.title}"

## Datos clave
- **Probabilidad actual**: ${yesPercentage}% para "Sí" / ${noPercentage}% para "No"
- **Liquidez total**: ${totalLiquidity.toLocaleString()} CHIPS
- **Actividad**: ${market.totalBets || 0} transacciones totales
- **Tiempo restante**: ${daysRemaining} días hasta resolución

## Análisis de tendencia
Este mercado ha mostrado una tendencia ${trendDirection} en las últimas 24 horas. ${
  yesPercentage > 65 || yesPercentage < 35
    ? 'Hay una fuerte convicción en un resultado específico, lo que puede indicar información privilegiada o sesgo colectivo.'
    : 'No hay una convicción clara entre los participantes, sugiriendo incertidumbre sobre el resultado final.'
}

## Análisis de liquidez
Con ${liquidityAssessment} (${totalLiquidity.toLocaleString()} CHIPS), ${
  totalLiquidity > 3000
    ? 'este mercado ofrece buenas oportunidades para entradas y salidas con slippage mínimo.'
    : 'este mercado podría experimentar cierta volatilidad con operaciones grandes debido a la limitada profundidad.'
}

## Consejos para traders
${entryRecommendation}

## Factores externos a considerar
* Cambios en políticas o condiciones que podrían afectar el resultado
* Comportamiento histórico de mercados similares
* Eventos próximos que puedan alterar las probabilidades

## Predicción algorítmica
Basado en los patrones actuales, nuestro algoritmo predice una probabilidad final cercana al ${
  Math.abs(yesPercentage - 50) < 10
    ? Math.round(40 + Math.random() * 20)
    : yesPercentage > 50
      ? Math.min(Math.round(yesPercentage + (Math.random() * 10 - 5)), 95)
      : Math.max(Math.round(yesPercentage + (Math.random() * 10 - 5)), 5)
}% para "Sí" al momento de la resolución.

_Análisis generado por ChipBids AI - ${new Date().toLocaleString()}_
        `,
        sentiment: yesPercentage > 60 ? 'bullish' : yesPercentage < 40 ? 'bearish' : 'neutral',
        confidence: Math.abs(yesPercentage - 50) > 25 ? 'high' : Math.abs(yesPercentage - 50) > 10 ? 'medium' : 'low'
      };
      
      setSummary(generatedSummary);
      setIsGenerating(false);
    }, 2500); // Simulamos un retraso de 2.5 segundos para dar sensación de procesamiento
  };

  return (
    <div className="bg-[#151515] rounded-lg border border-[#222] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#222]">
        <h3 className="font-medium text-white flex items-center gap-2">
          <span>Market Summary</span>
          <span className="text-xs bg-[#9945FF] text-white px-2 py-0.5 rounded">AI-powered</span>
        </h3>
        
        {!isGenerating && !summary && (
          <button 
            onClick={generateMarketSummary}
            className="flex items-center gap-1 bg-[#9945FF] hover:bg-[#8935ef] text-white text-sm py-1.5 px-3 rounded transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Generate</span>
          </button>
        )}
      </div>
      
      <div className="p-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-t-[#9945FF] border-r-[#00e5ff] border-b-[#00ff88] border-l-[#ff3366] rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-[#151515] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#9945FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-white font-medium">Analyzing market data...</p>
              <p className="text-gray-400 text-sm mt-1">Our AI is processing market trends and user behavior</p>
            </div>
          </div>
        ) : summary ? (
          <div>
            <div className="bg-[#101010] rounded-lg p-4 border border-[#222]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {summary.sentiment === 'bullish' && (
                    <span className="flex items-center gap-1 text-[#00ff88] bg-[#102010] px-2 py-1 rounded text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                      </svg>
                      Bullish
                    </span>
                  )}
                  
                  {summary.sentiment === 'bearish' && (
                    <span className="flex items-center gap-1 text-[#ff3366] bg-[#201020] px-2 py-1 rounded text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                      </svg>
                      Bearish
                    </span>
                  )}
                  
                  {summary.sentiment === 'neutral' && (
                    <span className="flex items-center gap-1 text-[#00e5ff] bg-[#102030] px-2 py-1 rounded text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
                      </svg>
                      Neutral
                    </span>
                  )}
                  
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    summary.confidence === 'high' 
                      ? 'text-[#00ff88] bg-[#102010]' 
                      : summary.confidence === 'medium'
                        ? 'text-[#ffcc00] bg-[#202010]'
                        : 'text-gray-400 bg-[#101010]'
                  }`}>
                    Confidence: {summary.confidence === 'high' ? 'High' : summary.confidence === 'medium' ? 'Medium' : 'Low'}
                  </span>
                </div>
                <button 
                  onClick={() => generateMarketSummary()}
                  className="text-xs text-[#00e5ff] hover:text-[#00b8cc] transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              <p className="text-gray-300">{summary.shortSummary}</p>
              
              {showFullSummary ? (
                <div className="mt-4 bg-[#0a0a0a] p-4 rounded border border-[#222] markdown-content">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {summary.fullAnalysis.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-lg font-semibold mt-3 mb-2">{line.replace('## ', '')}</h2>;
                      } else if (line.startsWith('* ')) {
                        return <li key={index} className="ml-4 text-gray-300">{line.replace('* ', '')}</li>;
                      } else if (line.startsWith('_')) {
                        return <p key={index} className="text-xs text-gray-500 italic mt-4">{line.replace('_', '').replace('_', '')}</p>;
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      } else {
                        return <p key={index} className="my-2 text-gray-300">{line}</p>;
                      }
                    })}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowFullSummary(true)}
                  className="mt-3 text-sm text-[#9945FF] hover:text-[#8935ef] transition-colors flex items-center"
                >
                  <span>View full analysis</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-[#101010] rounded-full p-4">
              <svg className="w-12 h-12 text-[#9945FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h4 className="text-lg font-medium text-white mt-4">AI Market Analysis</h4>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Generate an AI-powered analysis of this market to get insights on trends, sentiment, and trading opportunities.
            </p>
            <button 
              onClick={generateMarketSummary}
              className="mt-6 bg-[#9945FF] hover:bg-[#8935ef] text-white font-medium py-2 px-6 rounded-full shadow transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span>Generate Analysis</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketSummaryAI;