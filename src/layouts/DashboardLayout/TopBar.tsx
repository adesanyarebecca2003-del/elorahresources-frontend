import { useAuth } from "@/hooks/useAuth";

export const TopBar = () => {
  const { user, expiresAt, logout } = useAuth();

  const remainingSeconds = expiresAt
    ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
    : 0;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#9FD3B8] flex items-center justify-between px-6 z-50">
      <div className="font-semibold text-black">
        Welcome{user?.first_name ? `, ${user.first_name}` : ""}
      </div>

      <div className="flex items-center gap-4 text-black">
        <span className="text-sm">
          Session: {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <button
          onClick={logout}
          className="px-3 py-1 border border-[#C9A24D] rounded hover:bg-[#C9A24D] hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};