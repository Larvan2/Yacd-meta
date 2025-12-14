import { atom } from 'recoil';

export type FormattedConn = {
  id: string;
  upload: number;
  download: number;
  start: number;
  chains: string;
  rule: string;
  destinationPort: string;
  destinationIP: string;
  remoteDestination: string;
  sourceIP: string;
  sourcePort: string;
  source: string;
  host: string;
  sniffHost: string;
  type: string;
  network: string;
  process?: string;
  downloadSpeedCurr?: number;
  uploadSpeedCurr?: number;
};

// 当前活跃连接
export const connectionsState = atom<FormattedConn[]>({
  key: 'connectionsState',
  default: [],
});

// 已关闭连接
export const closedConnectionsState = atom<FormattedConn[]>({
  key: 'closedConnectionsState',
  default: [],
});

// 连接刷新暂停状态
export const isRefreshPausedState = atom<boolean>({
  key: 'isRefreshPausedState',
  default: false,
});

// 最大已关闭连接数量限制
export const MAX_CLOSED_CONNECTIONS = 100;
