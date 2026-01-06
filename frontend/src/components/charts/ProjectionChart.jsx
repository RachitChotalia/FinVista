import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 1. Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const ProjectionChart = ({ data, labels }) => {
  // 2. Default data if props aren't provided (for testing/skeleton states)
  const chartLabels = labels || ['2025', '2030', '2035', '2040', '2045', '2050'];
  const chartValues = data || [12, 45, 89, 150, 280, 410];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Projected Value',
        data: chartValues,
        borderColor: '#ff2e00', // Vermilion Red
        borderWidth: 2,
        // 3. Create the "Magma" Gradient Effect
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          // Top: Red with opacity
          gradient.addColorStop(0, 'rgba(255, 46, 0, 0.4)');
          // Bottom: Completely transparent
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          return gradient;
        },
        tension: 0.4, // Smooth curve
        pointBackgroundColor: '#000000',
        pointBorderColor: '#ff2e00',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ff2e00',
        pointHoverBorderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#050505', // Obsidian Black
        titleColor: '#fff',
        titleFont: {
          family: 'Space Mono, monospace',
          size: 14,
        },
        bodyColor: '#a3a3a3',
        bodyFont: {
          family: 'Space Mono, monospace',
          size: 12,
        },
        borderColor: '#333',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `VALUE: ₹${context.parsed.y}L`,
          title: (context) => `YEAR: ${context[0].label}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#1a1a1a', // Very subtle grid
          drawBorder: false,
        },
        ticks: {
          color: '#666',
          font: {
            family: 'Space Mono, monospace',
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: '#1a1a1a',
          drawBorder: false,
        },
        ticks: {
          color: '#666',
          font: {
            family: 'Space Mono, monospace',
            size: 10,
          },
          callback: (value) => `₹${value}L`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
        duration: 2000,
        easing: 'easeOutQuart'
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProjectionChart;