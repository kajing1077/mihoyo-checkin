"use client";

import { useState } from "react";
import Image from "next/image";
import { GameName, SuccessResponse } from "../api/checkin/types";
import Link from "next/link";

const gameNames: Record<GameName, string> = {
  genshin: "원신",
  starrail: "붕괴: 스타레일",
  zenless: "젠레스 존 제로",
  honkai: "붕괴3rd", // 필요시 추가
};

const CheckInPage = () => {
  const [results, setResults] = useState<SuccessResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkin");
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setResults(data.results); // 결과 저장
      } else {
        setError("체크인에 실패했습니다.");
      }
    } catch (err) {
      console.log(err);
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  function gameName(platform: GameName) {
    return gameNames[platform] || platform;
  }

  return (
    <div className="p-4">
      <div className="flex gap-x-4 items-center ">
        <div className="h-full">
          <button
            className="px-6 py-4 text-white bg-orange-500 rounded-full shadow-lg hover:bg-orange-400 transition duration-300" // 높이 설정
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? "체크인 중..." : "체크인 시작"}
          </button>
        </div>
        <div className="flex items-center justify-center">
          <Link
            as={"image"}
            target="_blank"
            href="https://www.hoyolab.com/home"
            prefetch={false}
            className="px-4 rounded-full border-2 border-transparent hover:border-orange-500 transition-all"
          >
            <div className="relative w-[80px] h-[60px]">
              <Image
                src="/images/hoyolab.png"
                alt="hoyolab link"
                fill
                priority
                className="object-contain" // Tailwind로 가로세로 비율 유지
                sizes="(max-width: 768px) 100vw, 50vw" // sizes prop 추가
              />
            </div>
          </Link>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {results.map((result) => (
          <div
            className="bg-white border border-gray-100 rounded-lg shadow-md p-4 flex flex-col items-center"
            key={`${result.platform}-${result.account.nickname}`}
          >
            <div className="flex items-center mb-2">
              <Image
                src={result.assets.icon}
                alt={`${result.platform} icon`}
                width={60}
                height={60}
                className="mr-4 rounded-full"
              />
              <h1 className="text-2xl font-semibold">
                {gameName(result.platform)}
              </h1>
            </div>
            <hr className="border-t border-gray-200 w-full my-2" />

            <h2 className="text-lg font-semibold">
              {result.account.nickname} (UID: {result.account.uid})
            </h2>
            <p className="text-gray-700">{result.result}</p>
            <p className="text-gray-500">이번달 체크인 횟수: {result.total}</p>

            <div className="flex flex-col items-center mt-4">
              <Image
                src={result.award.icon}
                alt="보상 아이콘"
                width={120}
                height={120}
              />
              <p className="flex items-center">
                <span className=" text-lg text-orange-500 font-bold">
                  {result.award.name}
                </span>
                <span>x {result.award.cnt} 획득</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckInPage;
