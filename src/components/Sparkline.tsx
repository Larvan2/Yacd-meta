import * as React from 'react';
import { Line } from 'react-chartjs-2';

import { chartJSResource, chartStyles, commonDataSetProps } from '../misc/chart';
import prettyBytes from '../misc/pretty-bytes';
import s from './Sparkline.module.scss';

const { useMemo } = React;

const extraChartOptions: any = {
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
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      intersect: false,
      mode: 'index',
    },
  },
  scales: {
    x: {
      type: 'time',
      display: false,
    },
    y: {
      display: false,
      beginAtZero: true,
    },
  },
  elements: {
    line: {
      borderWidth: 1,
      tension: 0.4,
    },
    point: {
      radius: 0,
    },
  },
};

export default function Sparkline({ data: dataArray, labels, type, styleIndex = 0 }) {
  chartJSResource.read();

  const options = useMemo(() => {
    return {
      ...extraChartOptions,
      plugins: {
        ...extraChartOptions.plugins,
        tooltip: {
          ...extraChartOptions.plugins.tooltip,
          displayColors: false,
          callbacks: {
            title: () => '',
            label(context) {
              if (context.parsed.y !== null) {
                const suffix = type === 'inuse' ? '' : '/s';
                return prettyBytes(context.parsed.y) + suffix;
              }
              return '';
            },
          },
        },
      },
    };
  }, [type]);

  const data = useMemo(
    () => ({
      datasets: [
        {
          ...commonDataSetProps,
          ...chartStyles[styleIndex][type],
          data: dataArray.map((v, i) => ({ x: labels[i], y: v })),
          fill: true,
        },
      ],
    }),
    [dataArray, labels, type, styleIndex]
  );

  return (
    <div className={s.sparkline}>
      <Line data={data} options={options} redraw={false} />
    </div>
  );
}
