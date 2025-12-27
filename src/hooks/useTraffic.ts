import { useEffect, useState } from 'react';

import { fetchData } from '~/api/traffic';
import { ClashAPIConfig } from '~/types';

export default function useTraffic(apiConfig: ClashAPIConfig) {
  const traffic = fetchData(apiConfig);
  const [data, setData] = useState({
    up: [...traffic.up],
    down: [...traffic.down],
    labels: [...traffic.labels],
  });

  useEffect(() => {
    return traffic.subscribe(() => {
      setData({
        up: [...traffic.up],
        down: [...traffic.down],
        labels: [...traffic.labels],
      });
    });
  }, [traffic]);

  return data;
}
