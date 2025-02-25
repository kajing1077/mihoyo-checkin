export type GameName = "genshin" | "honkai" | "starrail" | "zenless";

export type ConfigType = {
  [key in GameName]: {
    data: string[];
  };
};

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
  award: {
    name: string;
    count: number;
    icon: string;
  };
}
