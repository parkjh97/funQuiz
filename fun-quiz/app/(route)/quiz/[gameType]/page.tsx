export const dynamic = "force-dynamic";

type PageParams = Promise<{ gameType: string }>;

export default async function Page({ params }: { params: PageParams }) {
  const { gameType } = await params;

  return (
    <div className="text-2xl font-bold p-4">선택한 게임 타입: {gameType}</div>
  );
}
