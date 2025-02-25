"use client";

import { useState } from "react";
import Image from "next/image";

const CheckInPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkin");
      const data = await response.json();

      if (data.success) {
        setResults(data.results); // 결과 저장
      } else {
        setError("체크인에 실패했습니다.");
      }
    } catch (err) {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  function gameName(platform: string) {
    if (platform === "genshin") {
      return "원신";
    } else if (platform === "starrail") {
      return "붕괴: 스타레일";
    } else if (platform === "zenless") {
      return "젠레스 존 제로";
    }
    return platform;
  }

  return (
    <div className="p-4">
      <button
        className="px-6 py-2 text-white bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transition duration-300"
        onClick={handleCheckIn}
        disabled={loading}
      >
        {loading ? "체크인 중..." : "체크인 시작"}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {results.map((result, index) => (
          <div
            className="bg-white border border-gray-100 rounded-lg shadow-md p-4 flex flex-col items-center"
            key={index}
          >
            <div className="flex items-center mb-2">
              <Image
                src={result.assets.icon}
                alt={`${result.assets.game} icon`}
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
                <span>x {result.award.count} 획득</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* 헤더에 넣기 */}
      <a target="_blank" href="https://www.hoyolab.com/home">
        HoyoLab
      </a>
    </div>
  );
};

export default CheckInPage;
