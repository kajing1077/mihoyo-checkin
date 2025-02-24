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

  return (
    <div>
      <h1>게임 체크인</h1>
      <button onClick={handleCheckIn} disabled={loading}>
        {loading ? "체크인 중..." : "체크인 시작"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <Image
              src={result.assets.icon}
              alt={`${result.assets.game} icon`}
              width={50}
              height={50}
            />
            <h2>{result.platform}</h2>
            <p>{result.result}</p>
            <p>총 체크인 횟수: {result.total}</p>
            <p>
              계정: {result.account.nickname} (UID: {result.account.uid})
            </p>
            <p>
              보상: {result.award.name} x{result.award.count}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckInPage;
