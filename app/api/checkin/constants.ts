import { ConfigType, GameConfig, GameName } from "./types";

export const DEFAULT_CONSTANTS: Record<GameName, GameConfig> = {
  genshin: {
    ACT_ID: "e202102251931481",
    successMessage: "오늘 보상을 잘 받았어! 여행자~",
    signedMessage: "이미 보상을 받았어! 여행자~",
    game: "Genshin Impact",
    gameId: 2,
    assets: {
      author: "Paimon",
      game: "Genshin Impact",
      icon: "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/b700cce2ac4c68a520b15cafa86a03f0_2812765778371293568.png",
    },
    url: {
      info: "https://sg-hk4e-api.hoyolab.com/event/sol/info",
      home: "https://sg-hk4e-api.hoyolab.com/event/sol/home",
      sign: "https://sg-hk4e-api.hoyolab.com/event/sol/sign",
    },
  },
  honkai: {
    ACT_ID: "e202110291205111",
    successMessage: "You have successfully checked in today, Captain~",
    signedMessage: "You've already checked in today, Captain~",
    game: "Honkai Impact 3rd",
    gameId: 1,
    assets: {
      author: "Kiana",
      game: "Honkai Impact 3rd",
      icon: "https://fastcdn.hoyoverse.com/static-resource-v2/2024/02/29/3d96534fd7a35a725f7884e6137346d1_3942255444511793944.png",
    },
    url: {
      info: "https://sg-public-api.hoyolab.com/event/mani/info",
      home: "https://sg-public-api.hoyolab.com/event/mani/home",
      sign: "https://sg-public-api.hoyolab.com/event/mani/sign",
    },
  },
  starrail: {
    ACT_ID: "e202303301540311",
    successMessage: "오늘 보상을 잘 받았어! 개척자!",
    signedMessage: "이미 보상을 받았어! 개척자!",
    game: "Honkai: Star Rail",
    gameId: 6,
    assets: {
      author: "PomPom",
      game: "Honkai: Star Rail",
      icon: "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/74330de1ee71ada37bbba7b72775c9d3_1883015313866544428.png",
    },
    url: {
      info: "https://sg-public-api.hoyolab.com/event/luna/os/info",
      home: "https://sg-public-api.hoyolab.com/event/luna/os/home",
      sign: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
    },
  },
  zenless: {
    ACT_ID: "e202406031448091",
    successMessage: "축하드려요! 로프꾼님, 보상을 받으셨어요!",
    signedMessage: " 로프꾼님, 보상을 이미 받으셨어요!",
    game: "Zenless Zone Zero",
    gameId: 8,
    assets: {
      author: "Eous",
      game: "Zenless Zone Zero",
      icon: "https://zenless.hoyoverse.com/favicon.ico",
      // "https://hyl-static-res-prod.hoyoverse.com/communityweb/business/nap.png",
    },
    url: {
      info: "https://sg-public-api.hoyolab.com/event/luna/zzz/os/info",
      home: "https://sg-public-api.hoyolab.com/event/luna/zzz/os/home",
      sign: "https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign",
    },
  },
};

export const config: ConfigType = {
  genshin: {
    config: DEFAULT_CONSTANTS.genshin,
    data: [process.env.GENSHIN_COOKIE || ""],
  },
  honkai: {
    config: DEFAULT_CONSTANTS.honkai,
    data: [
      // ... more account cookies
    ],
  },
  starrail: {
    config: DEFAULT_CONSTANTS.starrail,
    data: [process.env.STARRAIL_COOKIE || ""],
  },
  zenless: {
    config: DEFAULT_CONSTANTS.zenless,
    data: [process.env.ZZZ_COOKIE || ""],
  },
};
