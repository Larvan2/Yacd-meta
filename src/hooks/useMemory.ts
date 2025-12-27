import { useEffect, useState } from 'react';

import { fetchData } from '~/api/memory';
import { ClashAPIConfig } from '~/types';

export default function useMemory(apiConfig: ClashAPIConfig) {
  const memory = fetchData(apiConfig);
  const [data, setData] = useState({
    inuse: [...memory.inuse],
    oslimit: [...memory.oslimit],
    labels: [...memory.labels],
  });

  useEffect(() => {
    return memory.subscribe(() => {
      setData({
        inuse: [...memory.inuse],
        oslimit: [...memory.oslimit],
        labels: [...memory.labels],
      });
    });
  }, [memory]);

  return data;
}
