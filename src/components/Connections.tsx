import './Connections.css';

import React from 'react';
import { Pause, Play, RefreshCcw, Settings, Tag, X as IconClose } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useRecoilState } from 'recoil';

import { ConnectionItem } from '~/api/connections';
import Select from '~/components/shared/Select';
import {
  closedConnectionsState,
  connectionsState,
  FormattedConn,
  isRefreshPausedState,
} from '~/store/connections';
import { State } from '~/store/types';

import * as connAPI from '../api/connections';
import useRemainingViewPortHeight from '../hooks/useRemainingViewPortHeight';
import { getClashAPIConfig } from '../store/app';
import s from './Connections.module.scss';
import ConnectionTable from './ConnectionTable';
import ContentHeader from './ContentHeader';
import Input from './Input';
import ModalCloseAllConnections from './ModalCloseAllConnections';
import ModalManageConnectionColumns from './ModalManageConnectionColumns';
import ModalSourceIP from './ModalSourceIP';
import { Fab, position as fabPosition } from './shared/Fab';
import { connect } from './StateProvider';
import SvgYacd from './SvgYacd';

const { useEffect, useState, useRef, useCallback } = React;
const ALL_SOURCE_IP = 'ALL_SOURCE_IP';

const sourceMapInit = localStorage.getItem('sourceMap')
  ? JSON.parse(localStorage.getItem('sourceMap'))
  : [];

const paddingBottom = 30;

function arrayToIdKv<T extends { id: string }>(items: T[]) {
  const o = {};
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    o[item.id] = item;
  }
  return o;
}

function hasSubstring(s: string, pat: string) {
  return s.toLowerCase().includes(pat.toLowerCase());
}

function filterConnIps(conns: FormattedConn[], ipStr: string) {
  return conns.filter((each) => each.sourceIP === ipStr);
}

function filterConns(conns: FormattedConn[], keyword: string, sourceIp: string) {
  let result = conns;
  if (keyword !== '') {
    result = conns.filter((conn) =>
      [
        conn.host,
        conn.sourceIP,
        conn.sourcePort,
        conn.destinationIP,
        conn.chains,
        conn.rule,
        conn.type,
        conn.network,
        conn.process,
      ].some((field) => {
        return hasSubstring(field, keyword);
      })
    );
  }
  if (sourceIp !== ALL_SOURCE_IP) {
    result = filterConnIps(result, sourceIp);
  }

  return result;
}

function getNameFromSource(
  source: string,
  sourceMap: { reg: string; name: string }[],
  defaultVal?: string
): string {
  let sourceName = defaultVal ?? source;

  sourceMap.forEach(({ reg, name }) => {
    if (!reg) return;

    if (reg.startsWith('/')) {
      const regExp = new RegExp(reg.replace('/', ''), 'g');

      if (regExp.test(source) && name) {
        sourceName = `${name}(${source})`;
      }
    } else {
      if (source === reg && name) {
        sourceName = `${name}(${source})`;
      }
    }
  });

  return sourceName;
}

function formatConnectionDataItem(
  i: ConnectionItem,
  prevKv: Record<string, { upload: number; download: number }>,
  now: number,
  sourceMap: { reg: string; name: string }[]
): FormattedConn {
  const { id, metadata, upload, download, start, chains, rule, rulePayload } = i;
  const {
    host,
    destinationPort,
    destinationIP,
    remoteDestination,
    network,
    type,
    sourceIP,
    sourcePort,
    process,
    sniffHost,
  } = metadata;
  // host could be an empty string if it's direct IP connection
  let host2 = host;
  if (host2 === '') host2 = destinationIP;
  const prev = prevKv[id];
  const source = `${sourceIP}:${sourcePort}`;

  const ret = {
    id,
    upload,
    download,
    start: now - new Date(start).valueOf(),
    chains: modifyChains(chains),
    rule: !rulePayload ? rule : `${rule} :: ${rulePayload}`,
    ...metadata,
    host: `${host2}:${destinationPort}`,
    sniffHost: sniffHost ? sniffHost : '-',
    type: `${type}(${network})`,
    source: getNameFromSource(sourceIP, sourceMap, source),
    downloadSpeedCurr: download - (prev ? prev.download : 0),
    uploadSpeedCurr: upload - (prev ? prev.upload : 0),
    process: process ? process : '-',
    destinationIP: remoteDestination || destinationIP || host,
  };
  return ret;
}
function modifyChains(chains: string[]): string {
  if (!Array.isArray(chains) || chains.length === 0) {
    return '';
  }

  if (chains.length === 1) {
    return chains[0];
  }

  //倒序
  if (chains.length === 2) {
    return `${chains[1]} -> ${chains[0]}`;
  }

  const first = chains.pop();
  const last = chains.shift();
  return `${first} -> ${last}`;
}

function renderTableOrPlaceholder(columns, hiddenColumns, conns: FormattedConn[]) {
  return conns.length > 0 ? (
    <ConnectionTable data={conns} columns={columns} hiddenColumns={hiddenColumns} />
  ) : (
    <div className={s.placeHolder}>
      <SvgYacd width={200} height={200} c1="var(--color-text)" />
    </div>
  );
}

function ConnQty({ qty }) {
  return qty < 100 ? '' + qty : '99+';
}

const sortDescFirst = true;
const hiddenColumnsOrigin = ['id'];
const columnsOrigin = [
  { accessor: 'id', show: false },
  { Header: 'c_type', accessor: 'type' },
  { Header: 'c_process', accessor: 'process' },
  { Header: 'c_host', accessor: 'host' },
  { Header: 'c_rule', accessor: 'rule' },
  { Header: 'c_chains', accessor: 'chains' },
  { Header: 'c_time', accessor: 'start' },
  { Header: 'c_dl_speed', accessor: 'downloadSpeedCurr', sortDescFirst },
  { Header: 'c_ul_speed', accessor: 'uploadSpeedCurr', sortDescFirst },
  { Header: 'c_dl', accessor: 'download', sortDescFirst },
  { Header: 'c_ul', accessor: 'upload', sortDescFirst },
  { Header: 'c_source', accessor: 'source' },
  { Header: 'c_destination_ip', accessor: 'destinationIP' },
  { Header: 'c_sni', accessor: 'sniffHost' },
  { Header: 'c_ctrl', accessor: 'ctrl' },
];

function Conn({ apiConfig }) {
  const { t } = useTranslation();
  const [showModalColumn, setModalColumn] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState(() => {
    const savedHiddenColumns = localStorage.getItem('hiddenColumns');
    return savedHiddenColumns ? JSON.parse(savedHiddenColumns) : [...hiddenColumnsOrigin];
  });
  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem('columns');
    const columnOrder = savedColumns ? JSON.parse(savedColumns) : null;
    return columnOrder
      ? [...columnsOrigin].sort((pre, next) => {
          const preIdx = columnOrder.findIndex((column) => column.accessor === pre.accessor);
          const nextIdx = columnOrder.findIndex((column) => column.accessor === next.accessor);

          if (preIdx === -1) {
            return 1;
          }

          if (nextIdx === -1) {
            return -1;
          }
          return preIdx - nextIdx;
        })
      : [...columnsOrigin];
  });

  const closeModalColumn = () => {
    setModalColumn(false);
  };

  const resetColumns = () => {
    setHiddenColumns([...hiddenColumnsOrigin]);
    setColumns([...columnsOrigin]);
    localStorage.removeItem('hiddenColumns');
    localStorage.removeItem('columns');
  };

  const [sourceMapModal, setSourceMapModal] = useState(false);
  const [sourceMap, setSourceMap] = useState(sourceMapInit);
  const [refContainer, containerHeight] = useRemainingViewPortHeight();

  // 使用 Recoil 全局状态，切换页面时保持数据
  const [conns, setConns] = useRecoilState(connectionsState);
  const [closedConns, setClosedConns] = useRecoilState(closedConnectionsState);

  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterSourceIpStr, setFilterSourceIpStr] = useState(ALL_SOURCE_IP);

  const filteredConns = filterConns(conns, filterKeyword, filterSourceIpStr);
  const filteredClosedConns = filterConns(closedConns, filterKeyword, filterSourceIpStr);

  const getConnIpList = (conns: FormattedConn[]) => {
    return [
      [ALL_SOURCE_IP, t('All')],
      ...Array.from(new Set(conns.map((x) => x.sourceIP)))
        .sort()
        .map((value) => {
          return [value, getNameFromSource(value, sourceMap).trim() || t('internel')];
        }),
    ];
  };
  const connIpSet = getConnIpList(conns);
  // const ClosedConnIpSet = getConnIpList(closedConns);

  const [isCloseFilterModalOpen, setIsCloseFilterModalOpen] = useState(false);
  const openCloseFilterModal = useCallback(() => setIsCloseFilterModalOpen(true), []);
  const closeCloseFilterModal = useCallback(() => setIsCloseFilterModalOpen(false), []);

  const closeFilterConnections = useCallback(async () => {
    for (const connection of filteredConns) {
      await connAPI.closeConnById(apiConfig, connection.id);
    }
    closeCloseFilterModal();
  }, [apiConfig, filteredConns, closeCloseFilterModal]);
  const [isCloseAllModalOpen, setIsCloseAllModalOpen] = useState(false);
  const openCloseAllModal = useCallback(() => setIsCloseAllModalOpen(true), []);
  const closeCloseAllModal = useCallback(() => setIsCloseAllModalOpen(false), []);
  // 使用 Recoil 全局状态
  const [isRefreshPaused, setIsRefreshPaused] = useRecoilState(isRefreshPausedState);
  const toggleIsRefreshPaused = useCallback(() => {
    setIsRefreshPaused((x) => !x);
  }, [setIsRefreshPaused]);
  const closeAllConnections = useCallback(() => {
    connAPI.closeAllConnections(apiConfig);
    closeCloseAllModal();
  }, [apiConfig, closeCloseAllModal]);
  // 使用 ref 保存上一次的连接数据，用于计算速度和检测关闭的连接
  // 初始化为当前 Recoil 状态中的值，确保页面切换回来时数据正确
  const prevConnsRef = useRef<FormattedConn[]>(conns);
  const read = useCallback(
    ({ connections }) => {
      const prevConnsKv = arrayToIdKv(prevConnsRef.current);
      const now = Date.now();
      const x =
        connections?.map((c: ConnectionItem) =>
          formatConnectionDataItem(c, prevConnsKv, now, sourceMap)
        ) ?? [];
      const closed = [];
      for (const c of prevConnsRef.current) {
        const idx = x.findIndex((conn: ConnectionItem) => conn.id === c.id);
        if (idx < 0) closed.push(c);
      }
      setClosedConns((prev) => {
        // keep max 100 entries
        return [...closed, ...prev].slice(0, 101);
      });
      // if previous connections and current connections are both empty
      // arrays, we wont update state to avaoid rerender
      if (x && (x.length !== 0 || prevConnsRef.current.length !== 0) && !isRefreshPaused) {
        prevConnsRef.current = x;
        setConns(x);
      } else {
        prevConnsRef.current = x;
      }
    },
    [setConns, setClosedConns, sourceMap, isRefreshPaused]
  );
  const [reConnectCount, setReConnectCount] = useState(0);

  useEffect(() => {
    return connAPI.fetchData(apiConfig, read, () => {
      setTimeout(() => {
        setReConnectCount((prev) => prev + 1);
      }, 1000);
    });
  }, [apiConfig, read, reConnectCount, setReConnectCount]);

  const openModalSource = () => {
    if (sourceMap.length === 0) {
      sourceMap.push({
        reg: '',
        name: '',
      });
    }
    setSourceMapModal(true);
  };
  const closeModalSource = () => {
    setSourceMap(sourceMap.filter((i) => i.reg || i.name));
    localStorage.setItem('sourceMap', JSON.stringify(sourceMap));
    setSourceMapModal(false);
  };

  return (
    <div>
      <div className={s.header}>
        <ContentHeader title={t('Connections')} />
        <div className={s.inputWrapper}>
          <Input
            type="text"
            name="filter"
            autoComplete="off"
            className={s.input}
            placeholder={t('Search')}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
      </div>
      <Tabs>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            paddingLeft: '30px',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: '30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <TabList
              style={{
                padding: '0 15px 0 0',
              }}
            >
              <Tab>
                <span>{t('Active')}</span>
                <span className={s.connQty}>
                  {/* @ts-expect-error ts-migrate(2786) FIXME: 'ConnQty' cannot be used as a JSX component. */}
                  <ConnQty qty={filteredConns.length} />
                </span>
              </Tab>
              <Tab>
                <span>{t('Closed')}</span>
                <span className={s.connQty}>
                  {/* @ts-expect-error ts-migrate(2786) FIXME: 'ConnQty' cannot be used as a JSX component. */}
                  <ConnQty qty={filteredClosedConns.length} />
                </span>
              </Tab>
            </TabList>
            <Select
              options={connIpSet}
              selected={filterSourceIpStr}
              style={{ width: 'unset' }}
              onChange={(e) => setFilterSourceIpStr(e.target.value)}
            />
          </div>
          <div className={s.toolbar}>
            <button
              className={s.toolbarBtn}
              onClick={openCloseAllModal}
              title={t('close_all_connections')}
            >
              <IconClose size={15} />
            </button>
            <button
              className={s.toolbarBtn}
              onClick={openCloseFilterModal}
              title={t('close_filter_connections')}
            >
              <IconClose size={13} />
              <span className={s.toolbarBtnBadge}>F</span>
            </button>
            <span className={s.toolbarDivider} />
            <button
              className={s.toolbarBtn}
              onClick={() => setModalColumn(true)}
              title={t('manage_column')}
            >
              <Settings size={15} />
            </button>
            <button className={s.toolbarBtn} onClick={resetColumns} title={t('reset_column')}>
              <RefreshCcw size={15} />
            </button>
            <button className={s.toolbarBtn} onClick={openModalSource} title={t('client_tag')}>
              <Tag size={15} />
            </button>
          </div>
        </div>
        <div ref={refContainer} style={{ padding: 30, paddingBottom: 10, paddingTop: 10 }}>
          <div
            style={{
              height: containerHeight - paddingBottom,
              overflow: 'auto',
            }}
          >
            <TabPanel>
              {renderTableOrPlaceholder(columns, hiddenColumns, filteredConns)}
              <Fab
                icon={isRefreshPaused ? <Play size={16} /> : <Pause size={16} />}
                mainButtonStyles={isRefreshPaused ? { background: '#e74c3c' } : {}}
                style={fabPosition}
                text={isRefreshPaused ? t('Resume Refresh') : t('Pause Refresh')}
                onClick={toggleIsRefreshPaused}
              />
            </TabPanel>
            <TabPanel>
              {renderTableOrPlaceholder(columns, hiddenColumns, filteredClosedConns)}
            </TabPanel>
          </div>
        </div>
        <ModalCloseAllConnections
          isOpen={isCloseAllModalOpen}
          primaryButtonOnTap={closeAllConnections}
          onRequestClose={closeCloseAllModal}
        />
        <ModalCloseAllConnections
          confirm={'close_filter_connections'}
          isOpen={isCloseFilterModalOpen}
          primaryButtonOnTap={closeFilterConnections}
          onRequestClose={closeCloseFilterModal}
        />
        <ModalManageConnectionColumns
          isOpen={showModalColumn}
          onRequestClose={closeModalColumn}
          columns={columns}
          hiddenColumns={hiddenColumns}
          setColumns={setColumns}
          setHiddenColumns={setHiddenColumns}
        />
        <ModalSourceIP
          isOpen={sourceMapModal}
          onRequestClose={closeModalSource}
          sourceMap={sourceMap}
          setSourceMap={setSourceMap}
        />
      </Tabs>
    </div>
  );
}

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
});

export default connect(mapState)(Conn);
