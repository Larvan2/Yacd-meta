import * as React from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { State } from '~/store/types';

import useTraffic from '../hooks/useTraffic';
import {
  chartJSResource,
  chartStyles,
  commonChartOptions,
  commonDataSetProps,
} from '../misc/chart';
import { getClashAPIConfig, getSelectedChartStyleIndex } from '../store/app';
import { connect } from './StateProvider';
import s0 from './TrafficChart.module.scss';

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

export default connect(mapState)(TrafficChart);

function TrafficChart({ apiConfig, selectedChartStyleIndex }) {
  chartJSResource.read();
  const traffic = useTraffic(apiConfig);
  const { t } = useTranslation();
  const data = useMemo(
    () => ({
      datasets: [
        {
          ...commonDataSetProps,
          ...chartStyles[selectedChartStyleIndex].up,
          label: t('Up'),
          data: traffic.up.map((v, i) => ({ x: traffic.labels[i], y: v })),
        },
        {
          ...commonDataSetProps,
          ...chartStyles[selectedChartStyleIndex].down,
          label: t('Down'),
          data: traffic.down.map((v, i) => ({ x: traffic.labels[i], y: v })),
        },
      ],
    }),
    [traffic.up, traffic.down, traffic.labels, selectedChartStyleIndex, t]
  );

  return (
    <div style={chartWrapperStyle}>
      <Line data={data} options={commonChartOptions} className={s0.TrafficChart} />
    </div>
  );
}
