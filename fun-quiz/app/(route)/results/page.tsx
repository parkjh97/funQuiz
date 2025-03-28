import Link from "next/link";

export default function Page({ params }: { params: { score: any } }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col">
      <h1 className="text-3xl font-bold mb-4">결과</h1>
      <p className="text-lg mb-6">
        당신의 점수는 <strong>{params.score}</strong>점입니다!
      </p>
      <Link href="/">
        <span className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          다시 시도하기
        </span>
      </Link>
    </div>
  );
}
