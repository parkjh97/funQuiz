"use client";
import { useRouter } from "next/navigation";

interface gameLists {
  name: string;
  url: string;
  image: string;
}

const gameLists: gameLists[] = [
  {
    name: "인물 퀴즈 (전체)",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${encodeURIComponent(
      "human_all"
    )}`,
    image: "https://dummyimage.com/80x80",
  },
  {
    name: "인물 퀴즈 (예능인)",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${encodeURIComponent(
      "human_entertainer"
    )}`,
    image: "https://dummyimage.com/84x84",
  },
  {
    name: "인물 퀴즈 (배우)",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${encodeURIComponent(
      "human_actor"
    )}`,
    image: "https://dummyimage.com/88x88",
  },
  {
    name: "인물 퀴즈 (스포츠인)",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${encodeURIComponent(
      "human_sportstar"
    )}`,
    image: "https://dummyimage.com/90x90",
  },
  {
    name: "인물 퀴즈 (가수)",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${encodeURIComponent(
      "human_singer"
    )}`,
    image: "https://dummyimage.com/94x94",
  },
];

function ChoiceGame() {
  const router = useRouter();
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
            재미난다
          </h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
            🎮 게임 모드를 선택해주세요 🎮
          </p>
        </div>
        <div className="flex flex-wrap -m-2">
          {gameLists.map((member, index) => (
            <div key={index} className="p-2 lg:w-1/3 md:w-1/2 w-full">
              <div
                className="h-full flex items-center justify-between border border-gray-200 p-4 rounded-lg cursor-pointer hover:shadow-md transition"
                onClick={() => router.push(member.url)}
              >
                <div className="flex items-center">
                  <img
                    alt={member.name}
                    className="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4"
                    src={member.image}
                  />
                  <div className="flex-grow">
                    <h2 className="text-gray-900 title-font font-medium">
                      {member.name}
                    </h2>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-gray-400 hover:text-gray-600 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ChoiceGame;
