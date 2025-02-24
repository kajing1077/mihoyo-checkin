import { NextResponse } from "next/server";

type GameName = "genshin" | "honkai" | "starrail" | "zenless";

type ConfigType = {
  [key in GameName]: {
    data: string[];
  };
};

interface AccountData {
  game_role_id: string;
  nickname: string;
  level: number;
  region: string;
  game_id: number;
}

interface GameConfig {
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

const DEFAULT_CONSTANTS: Record<GameName, GameConfig> = {
  genshin: {
    ACT_ID: "e202102251931481",
    successMessage:
      "Congratulations, Traveler! You have successfully checked in today~",
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
    successMessage: "You have successfully checked in today, Trailblazer~",
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
    successMessage:
      "Congratulations Proxy! You have successfully checked in today!~",
    signedMessage: "보상을 이미 받으셨어요! 로프꾼님!",
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

const config: ConfigType = {
  genshin: {
    data: [process.env.GENSHIN_COOKIE || ""],
  },
  honkai: {
    data: [
      // ... more account cookies
    ],
  },
  starrail: {
    data: [process.env.STARRAIL_COOKIE || ""],
  },
  zenless: {
    data: [process.env.ZZZ_COOKIE || ""],
  },
};

function mapAwardNameToKorean(awardName: string): string {
  const awardMapping: { [key: string]: string } = {
    Mora: "모라",
    "Condensed Aether": "응축된 에테르",
    Polychromes: "폴리크롬",
  };
  return awardMapping[awardName] || awardName; // 매핑된 이름이 없으면 원래 이름 반환
}

class Game {
  name: GameName; // Use the GameName type
  fullName: string;
  config: GameConfig; // Use the GameConfig type
  data: string[];

  constructor(name: GameName, config: any) {
    this.name = name;
    this.fullName = DEFAULT_CONSTANTS[name].game;
    this.config = { ...DEFAULT_CONSTANTS[name], ...config };
    this.data = config.data || [];

    if (this.data.length === 0) {
      console.warn(`No ${this.fullName} accounts provided. Skipping...`);
      return;
    }
  }

  async checkAndExecute() {
    const accounts = this.data;
    if (accounts.length === 0) {
      console.warn(`No active accounts found for ${this.fullName}`);
      return [];
    }

    const success = [];
    for (const cookie of accounts) {
      try {
        const match = cookie.match(/ltuid_v2=([^;]+)/);
        if (!match) {
          console.warn(`No ltuid found in cookie: ${cookie}`);
          continue; // Skip to the next cookie if ltuid is not found
        }
        const ltuid = match[1]; // Safe to access match[1] now

        const accountDetails = await this.getAccountDetails(cookie, ltuid);
        if (!accountDetails) {
          continue;
        }

        const info = await this.getSignInfo(cookie);
        if (!info.success || !info.data) {
          continue;
        }

        const awardsData = await this.getAwardsData(cookie);
        if (!awardsData.success) {
          continue;
        }

        const awards = awardsData.data;
        const data = {
          total: info.data.total,
          today: info.data.today,
          isSigned: info.data.isSigned,
        };

        // 이미 체크인한 경우에도 보상 정보를 포함
        const totalSigned = data.total;
        const awardObject = {
          name: mapAwardNameToKorean(awards[totalSigned]?.name) || "보상 없음", // 보상 이름
          count: awards[totalSigned]?.cnt || 0, // 보상 수량
          icon: awards[totalSigned]?.icon || "", // 보상 아이콘
        };

        if (data.isSigned) {
          console.info(`${this.fullName}:CheckIn`, "Already signed in today");
          success.push({
            platform: this.name,
            total: data.total,
            result: this.config.signedMessage, // 이미 체크인한 경우의 메시지
            assets: { ...this.config.assets },
            account: {
              uid: accountDetails.uid,
              nickname: accountDetails.nickname,
              rank: accountDetails.rank,
              region: accountDetails.region,
              cookie,
            },
            award: awardObject, // 보상 정보 포함
          });
          continue; // 다음 쿠키로 넘어감
        }
        // if (data.isSigned) {
        //   console.info(`${this.fullName}:CheckIn`, "Already signed in today");
        //   continue;
        // }

        // const totalSigned = data.total;
        // const awardObject = {
        //   name: awards[totalSigned].name,
        //   count: awards[totalSigned].cnt,
        //   icon: awards[totalSigned].icon,
        // };

        const sign = await this.sign(cookie);
        if (!sign.success) {
          continue;
        }

        console.info(
          `${this.fullName}:CheckIn`,
          `Today's Reward: ${awardObject.name} x${awardObject.count}`
        );

        success.push({
          platform: this.name,
          total: data.total + 1,
          result: this.config.successMessage,
          assets: { ...this.config.assets },
          account: {
            uid: accountDetails.uid,
            nickname: accountDetails.nickname,
            rank: accountDetails.rank,
            region: accountDetails.region,
            cookie,
          },
          award: awardObject,
        });
      } catch (e) {
        console.error(`${this.fullName}:CheckIn`, e);
      }
    }

    return success;
  }

  async getAccountDetails(cookieData: string, ltuid: string) {
    // Todo
    try {
      const options = {
        method: "GET",
        headers: {
          // "User-Agent": this.userAgent,
          Cookie: cookieData,
        },
      };

      const url = `https://bbs-api-os.hoyolab.com/game_record/card/wapi/getGameRecordCard?uid=${ltuid}`;
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.status !== 200 || data.retcode !== 0) {
        throw new Error(
          `Failed to login to ${this.fullName} account: ${JSON.stringify(data)}`
        );
      }

      const accountData: AccountData | undefined = data.data.list.find(
        (account: AccountData) => account.game_id === this.config.gameId
      );
      if (!accountData) {
        throw new Error(
          `No ${this.fullName} account found for ltuid: ${ltuid}`
        );
      }

      console.log(`Account Region for ${this.fullName}: ${accountData.region}`);
      return {
        uid: accountData.game_role_id,
        nickname: accountData.nickname,
        rank: accountData.level,
        region: this.fixRegion(accountData.region),
      };
    } catch (e) {
      console.error(`${this.fullName}:login`, `Error: ${e.message}`);
      throw e; // Re-throw to be handled by the caller
    }
  }

  async sign(cookieData: string) {
    try {
      const payload = { act_id: this.config.ACT_ID };
      const options = {
        method: "POST",
        headers: {
          // "User-Agent": this.userAgent,
          Cookie: cookieData,
          "x-rpc-signgame": this.getSignGameHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch(this.config.url.sign, options);
      const data = await response.json();

      console.log("API Response Data:", data);

      if (response.status !== 200 || data.retcode !== 0) {
        console.error(`${this.fullName}:sign`, "Failed to sign in.", data);
        return { success: false };
      }

      return { success: true };
    } catch (e) {
      console.error(`${this.fullName}:sign`, `Error: ${e.message}`);
      return { success: false };
    }
  }

  getSignGameHeader() {
    switch (this.name) {
      case "starrail":
        return "hkrpg";
      case "genshin":
        return "hk4e";
      case "zenless":
        return "zzz";
      default:
        return "";
    }
  }

  async getSignInfo(cookieData: string) {
    try {
      const url = `${this.config.url.info}?act_id=${this.config.ACT_ID}`;
      const response = await fetch(url, {
        headers: {
          Cookie: cookieData,
          "x-rpc-signgame": this.getSignGameHeader(),
        },
      });
      const data = await response.json();

      if (response.status !== 200 || data.retcode !== 0) {
        console.error(
          `${this.fullName}:getSignInfo`,
          "Failed to get sign info.",
          data
        );
        return { success: false };
      }

      return {
        success: true,
        data: {
          total: data.data.total_sign_day,
          today: data.data.today,
          isSigned: data.data.is_sign,
        },
      };
    } catch (e) {
      console.error(`${this.fullName}:getSignInfo`, `Error: ${e.message}`);
      return { success: false };
    }
  }

  async getAwardsData(cookieData: string) {
    try {
      const url = `${this.config.url.home}?act_id=${this.config.ACT_ID}`;
      const response = await fetch(url, {
        headers: {
          Cookie: cookieData,
          "x-rpc-signgame": this.getSignGameHeader(),
        },
      });
      const data = await response.json();

      if (response.status !== 200 || data.retcode !== 0) {
        console.error(
          `${this.fullName}:getAwardsData`,
          "Failed to get awards data.",
          data
        );
        return { success: false };
      }

      if (data.data.awards.length === 0) {
        console.warn(
          `${this.fullName}:getAwardsData`,
          "No awards data available."
        );
      }

      return { success: true, data: data.data.awards };
    } catch (e) {
      console.error(`${this.fullName}:getAwardsData`, `Error: ${e.message}`);
      return { success: false };
    }
  }

  fixRegion(region: string): string {
    switch (region) {
      case "os_cht":
      case "prod_gf_sg":
      case "prod_official_cht":
        return "TW";
      case "os_asia":
      case "prod_gf_jp":
      case "prod_official_asia":
        return "SEA";
      case "eur01":
      case "os_euro":
      case "prod_gf_eu":
      case "prod_official_eur":
        return "EU";
      case "usa01":
      case "os_usa":
      case "prod_gf_us":
      case "prod_official_usa":
        return "NA";

      case "os_kr": // 한국 지역 추가
      case "prod_gf_kr":
        return "KR"; // 한국
      default:
        return "Unknown";
    }
  }

  // get userAgent() {
  //   return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  // }
}

export async function GET() {
  const results = [];
  for (const gameName of Object.keys(config) as GameName[]) {
    const game = new Game(gameName, config[gameName]);
    const gameResults = await game.checkAndExecute();
    results.push(...gameResults);
  }
  return NextResponse.json({ success: true, results });
}
