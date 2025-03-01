export type GameName = "genshin" | "honkai" | "starrail" | "zenless";

export type Result<T, E> =
  | { type: "success"; value: T }
  | { type: "error"; error: E };

export interface ConfigEntry {
  config: GameConfig;
  data: string[];
}
export type ConfigType = Record<GameName, ConfigEntry>;

export interface Award {
  name: string;
  cnt: number;
  icon: string;
}

export interface AccountData {
  game_role_id: string;
  nickname: string;
  level: number;
  region: string;
  game_id: number;
}

export interface GameConfig {
  ACT_ID: string;
  successMessage: string;
  signedMessage: string;
  game: string;
  gameId: number;
  assets: {
    author: string;
    game: string;
    icon: string;
  };
  url: {
    info: string;
    home: string;
    sign: string;
  };
}

export interface SuccessResponse {
  platform: GameName;
  total: number;
  result: string;
  assets: {
    author: string;
    game: string;
    icon: string;
  };
  account: {
    uid: string;
    nickname: string;
    rank: number;
    region: string;
    cookie: string;
  };
  award: Award;
}

export interface SignInfoData {
  total: number;
  today: string;
  isSigned: boolean;
}

export interface SignInfoResponse {
  success: boolean;
  data?: SignInfoData;
}
