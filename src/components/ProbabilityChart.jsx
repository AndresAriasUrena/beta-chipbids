// src/components/ProbabilityChart.jsx
"use client";

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const ProbabilityChart = ({ 
  period = 'all',
  marketData = null,
  yesLabel = 'SÍ',
  noLabel = 'NO'
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulación de datos de evolución
  const generateHistoricalData = (period) => {
    // Fechas basadas en el período seleccionado
    const now = new Date();
    let dates = [];
    let dataPoints = 0;
    
    switch(period) {
      case '1h':
        // Cada 5 minutos durante la última hora
        dataPoints = 12;
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(now);
          date.setMinutes(now.getMinutes() - (dataPoints - i - 1) * 5);
          dates.push(date);
        }
        break;
      case '6h':
        // Cada 30 minutos durante las últimas 6 horas
        dataPoints = 12;
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(now);
          date.setMinutes(now.getMinutes() - (dataPoints - i - 1) * 30);
          dates.push(date);
        }
        break;
      case '1d':
        // Cada hora durante el último día
        dataPoints = 24;
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(now);
          date.setHours(now.getHours() - (dataPoints - i - 1));
          dates.push(date);
        }
        break;
      case '1w':
        // Cada día durante la última semana
        dataPoints = 7;
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - (dataPoints - i - 1));
          dates.push(date);
        }
        break;
      case '1m':
        // Cada 3 días durante el último mes
        dataPoints = 10;
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - (dataPoints - i - 1) * 3);
          dates.push(date);
        }
        break;
      case 'all':
      default:
        // Evolución más larga (por ejemplo, 3 meses)
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        
        // Agregar fechas cada 9 días aproximadamente
        dataPoints = 10;
        const dayInterval = Math.round((now - startDate) / (dataPoints - 1) / (24 * 60 * 60 * 1000));
        
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + (i * dayInterval));
          dates.push(date);
        }
        break;
    }
    
    // Crear datos de probabilidad simulados
    // Comenzando con aproximadamente 50-50 y evolucionando a los valores actuales
    let yesData = [];
    let noData = [];
    
    // Valores actuales (porcentajes) - tomamos del marketData o usamos valores predeterminados
    const currentYesPercentage = marketData?.yesPercentage || 60;
    const currentNoPercentage = marketData?.noPercentage || 40;
    
    // Generamos una tendencia desde 50-50 hasta los valores actuales con algo de variación
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1); // Desde 0 hasta 1
      
      // Calcula el valor de tendencia mezclando el inicio (50%) con el valor final (valor actual)
      const trendYes = 50 * (1 - progress) + currentYesPercentage * progress;
      // El valor no es el complemento para sumar 100%
      const trendNo = 100 - trendYes;
      
      // Añade una pequeña variación aleatoria
      const variation = (Math.random() - 0.5) * 5; // Variación de ±2.5%
      const adjustedYes = Math.min(Math.max(trendYes + variation, 0), 100);
      const adjustedNo = 100 - adjustedYes;
      
      yesData.push(adjustedYes);
      noData.push(adjustedNo);
    }
    
    return {
      labels: dates.map(date => {
        if (period === '1h' || period === '6h') {
          return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (period === '1d') {
          return date.toLocaleTimeString('es-ES', { hour: '2-digit' });
        } else {
          return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        }
      }),
      datasets: [
        {
          label: yesLabel,
          data: yesData,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#00ff88',
        },
        {
          label: noLabel,
          data: noData,
          borderColor: '#ff3366',
          backgroundColor: 'rgba(255, 51, 102, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#ff3366',
        }
      ]
    };
  };

  useEffect(() => {
    if (!isClient || !chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    
    // Obtener los datos según el período
    const data = generateHistoricalData(period);
    
    // Destruir el gráfico existente si hay uno
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Configuración del gráfico
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: '#151515',
            titleColor: '#ffffff',
            bodyColor: '#bbbbbb',
            borderColor: '#222222',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
              }
            }
          },
          legend: {
            display: true,
            labels: {
              color: '#bbbbbb',
              font: {
                size: 12,
              },
              boxWidth: 12,
              usePointStyle: true,
            },
            position: 'top',
            align: 'end',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#666666',
              font: {
                size: 11,
              },
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(0, 229, 255, 0.05)',
              drawBorder: false,
            }
          },
          x: {
            ticks: {
              color: '#666666',
              font: {
                size: 11,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6,
            },
            grid: {
              display: false,
              drawBorder: false,
            }
          }
        }
      }
    });

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [period, isClient, marketData, yesLabel, noLabel]);

  return (
    <div className="bg-[#101010] p-4 rounded-lg border border-[#222] h-64 w-full">
      {isClient ? (
        <canvas ref={chartRef} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Cargando gráfico...</p>
        </div>
      )}
    </div>
  );
};

export default ProbabilityChart;