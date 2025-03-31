import { cn } from "@/app/utils";

function LoginButton() {
  return (
    <button
      className={cn("flex flex-col items-center justify-center")}
      aria-label="login, logout"
    >
      {/* {isLogin === "authenticated" ? "내 계정" : "로그인"} */}
      로그인
    </button>
  );
}
export default LoginButton;
