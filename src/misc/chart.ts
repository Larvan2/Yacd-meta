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

export const commonChartOptions: any = {
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
            label += prettyBytes(context.parsed.y) + '/s';
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
        maxTicksLimit: 5,
        callback(value: number) {
          return prettyBytes(value) + '/s ';
        },
      },
    },
  },
};

export const chartStyles = [
  {
    down: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)',
    },
    up: {
      backgroundColor: 'rgba(219, 77, 109, 0.5)',
      borderColor: 'rgb(219, 77, 109)',
    },
    inuse: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)',
    },
  },
  {
    up: {
      backgroundColor: 'rgba(245,78,162,0.6)',
      borderColor: 'rgba(245,78,162,1)',
    },
    down: {
      backgroundColor: 'rgba(123,59,140,0.6)',
      borderColor: 'rgba(66,33,142,1)',
    },
    inuse: {
      backgroundColor: 'rgba(123,59,140,0.6)',
      borderColor: 'rgba(66,33,142,1)',
    },
  },
  {
    up: {
      backgroundColor: 'rgba(94, 175, 223, 0.3)',
      borderColor: 'rgb(94, 175, 223)',
    },
    down: {
      backgroundColor: 'rgba(139, 227, 195, 0.3)',
      borderColor: 'rgb(139, 227, 195)',
    },
    inuse: {
      backgroundColor: 'rgba(139, 227, 195, 0.3)',
      borderColor: 'rgb(139, 227, 195)',
    },
  },
  {
    up: {
      backgroundColor: 'rgba(242, 174, 62, 0.3)',
      borderColor: 'rgb(242, 174, 62)',
    },
    down: {
      backgroundColor: 'rgba(69, 154, 248, 0.3)',
      borderColor: 'rgb(69, 154, 248)',
    },
    inuse: {
      backgroundColor: 'rgba(69, 154, 248, 0.3)',
      borderColor: 'rgb(69, 154, 248)',
    },
  },
];
