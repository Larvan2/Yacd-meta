import { createAsset } from 'use-asset';

import prettyBytes from './pretty-bytes';
export const chartJSResource = createAsset(() => {
  return import('~/misc/chart-lib');
});

export const commonDataSetProps = {
  borderWidth: 1.5,
  pointRadius: 0,
  tension: 0.4,
  fill: true,
  pointHitRadius: 10,
  pointHoverRadius: 4,
};

export const memoryChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  parsing: false,
  animation: {
    duration: 1000,
    easing: 'linear',
  },
  animations: {
    y: {
      duration: 0,
    },
    x: {
      duration: 0,
    },
  },
  transitions: {
    active: {
      animation: {
        duration: 0,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 15,
      },
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      padding: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      callbacks: {
        label(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += prettyBytes(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      display: false,
    },
    y: {
      type: 'linear',
      display: true,
      beginAtZero: true,
      grace: '5%',
      grid: {
        display: true,
        color: 'rgba(128, 128, 128, 0.1)',
        drawTicks: false,
      },
      border: {
        display: false,
        dash: [5, 5],
      },
      ticks: {
        maxTicksLimit: 3,
        callback(value: number) {
          return prettyBytes(value);
        },
      },
    },
  },
};

export const chartStyles = [
  {
    inuse: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)',
    },
  },
  {
    inuse: {
      backgroundColor: 'rgba(245,78,162,0.6)',
      borderColor: 'rgba(245,78,162,1)',
    },
  },
  {
    inuse: {
      backgroundColor: 'rgba(94, 175, 223, 0.3)',
      borderColor: 'rgb(94, 175, 223)',
    },
  },
  {
    inuse: {
      backgroundColor: 'rgba(242, 174, 62, 0.3)',
      borderColor: 'rgb(242, 174, 62)',
    },
  },
];
