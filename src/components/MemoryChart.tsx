import * as React from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { State } from '~/store/types';

import useMemory from '../hooks/useMemory';
import {
  chartJSResource,
  chartStyles,
  commonDataSetProps,
  memoryChartOptions,
} from '../misc/chart-memory';
import { getClashAPIConfig, getSelectedChartStyleIndex } from '../store/app';
import s0 from './MemoryChart.module.scss';
import { connect } from './StateProvider';

const { useMemo } = React;

const chartWrapperStyle: React.CSSProperties = {
  // make chartjs chart responsive
  justifySelf: 'center',
  position: 'relative',
  width: '100%',
  height: '100%',
};

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
  selectedChartStyleIndex: getSelectedChartStyleIndex(s),
});

export default connect(mapState)(MemoryChart);

function MemoryChart({ apiConfig, selectedChartStyleIndex }) {
  chartJSResource.read();
  const memory = useMemory(apiConfig);
  const { t } = useTranslation();
  const data = useMemo(
    () => ({
      datasets: [
        {
          ...commonDataSetProps,
          ...memoryChartOptions,
          ...chartStyles[selectedChartStyleIndex].inuse,
          label: t('Memory'),
          data: memory.inuse.map((v, i) => ({ x: memory.labels[i], y: v })),
        },
      ],
    }),
    [memory.inuse, memory.labels, selectedChartStyleIndex, t]
  );

  return (
    <div style={chartWrapperStyle}>
      <Line data={data} options={memoryChartOptions} className={s0.TrafficChart} />
    </div>
  );
}
