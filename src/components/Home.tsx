import React from 'react';
import { useTranslation } from 'react-i18next';

import ContentHeader from './ContentHeader';
import s0 from './Home.module.scss';
import TrafficNow from './TrafficNow';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div>
      <ContentHeader title={t('Overview')} />
      <div className={s0.root}>
        <TrafficNow />
      </div>
    </div>
  );
}
