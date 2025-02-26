import { NextResponse } from "next/server";
import {
  AccountData,
  ConfigType,
  GameConfigWithData,
  GameName,
  Result,
  SuccessResponse,
} from "./types";
import { config, DEFAULT_CONSTANTS } from "./constants";

class Game {
  name: GameName; // Use the GameName type
  fullName: string;
  config: GameConfigWithData;
  data: string[];

  constructor(name: GameName, config: ConfigType[GameName]) {
    this.name = name;
    this.fullName = DEFAULT_CONSTANTS[name].game;
    this.config = { ...DEFAULT_CONSTANTS[name], ...config };
    this.data = config.data || [];

    if (this.data.length === 0) {
      console.warn(`No ${this.fullName} accounts provided. Skipping...`);
      return;
    }
  }

  async checkAndExecute(): Promise<
    Result<SuccessResponse[], { message: string; code?: number }>
  > {
    const accounts = this.data;
    if (accounts.length === 0) {
      console.warn(
        `No active accounts found for ${this.fullName}. Skipping...`
      );
      return { type: "success", value: [] }; // 빈 배열 반환
    }

    const success: SuccessResponse[] = [];
    for (const cookie of accounts) {
      try {
        const match = cookie.match(/ltuid_v2=([^;]+)/);
        if (!match) {
          return {
            type: "error",
            error: { message: `No ltuid found in cookie: ${cookie}` },
          };
        }

        const ltuid = match[1]; // Safe to access match[1] now

        const accountDetailsResult = await this.getAccountDetails(
          cookie,
          ltuid
        );
        if (accountDetailsResult.type === "error") {
          return accountDetailsResult; // 오류 반환
        }
        const accountDetails = accountDetailsResult.value; // 성공 시 값 추출

        const info = await this.getSignInfo(cookie);
        if (!info.success || !info.data) {
          return {
            type: "error",
            error: { message: `Failed to get sign info` },
          };
        }

        const awardsData = await this.getAwardsData(cookie);
        if (!awardsData.success) {
          return {
            type: "error",
            error: { message: `Failed to get awards data` },
          };
        }
        const awards = awardsData.data;
        const data = {
          total: info.data.total,
          today: info.data.today,
          isSigned: info.data.isSigned,
        };

        // 이미 체크인한 경우에도 보상 정보를 포함
        const totalSigned = data.total;
        const awardIndex = totalSigned > 0 ? totalSigned - 1 : 0;
        const awardObject = {
          name: awards[awardIndex]?.name || "보상 없음", // 보상 이름
          count: awards[awardIndex]?.cnt || 0, // 보상 수량
          icon: awards[awardIndex]?.icon || "", // 보상 아이콘
        };

        if (data.isSigned) {
          console.info(`${this.fullName}:CheckIn`, "Already signed in today");
          success.push({
            platform: this.name,
            total: data.total,
            result: this.config.signedMessage,
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
          continue;
        }

        const sign = await this.sign(cookie);
        if (!sign.success) {
          return { type: "error", error: { message: `Failed to sign in` } };
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
        return {
          type: "error",
          error: { message: `Unexpected error: ${e.message}` },
        };
      }
    }

    return { type: "success", value: success };
  }

  async getAccountDetails(
    cookieData: string,
    ltuid: string
  ): Promise<
    Result<
      { uid: string; nickname: string; rank: number; region: string },
      { message: string; code?: number }
    >
  > {
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
        return {
          type: "error",
          error: {
            message: `Failed to login to ${
              this.fullName
            } account: ${JSON.stringify(data)}`,
          },
        };
      }

      const accountData: AccountData | undefined = data.data.list.find(
        (account: AccountData) => account.game_id === this.config.gameId
      );
      if (!accountData) {
        return {
          type: "error",
          error: {
            message: `No ${this.fullName} account found for ltuid: ${ltuid}`,
          },
        };
      }
      console.log(`Account Region for ${this.fullName}: ${accountData.region}`);
      return {
        type: "success",
        value: {
          uid: accountData.game_role_id,
          nickname: accountData.nickname,
          rank: accountData.level,
          region: this.fixRegion(accountData.region),
        },
      };
    } catch (e) {
      return {
        type: "error",
        error: { message: `Error in getAccountDetails: ${e.message}` },
      };
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
      const url = `${this.config.url.home}?act_id=${this.config.ACT_ID}&lang=ko-kr`;
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
    if (gameResults.type === "error") {
      return NextResponse.json(gameResults.error, { status: 500 });
    }
    results.push(...gameResults.value);
  }
  return NextResponse.json({ success: true, results });
}
