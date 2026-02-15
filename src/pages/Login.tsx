import { useState } from "react";
import api from "@/services/axios";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      login(response.data.access_token);
    } catch (err: any) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#9FD3B8] p-8 rounded-lg shadow-lg"
      >
        <div className="flex flex-col items-center mb-6">
          <img src="/elorahlogo.png" alt="EL'ORAH ERP" className="h-16 mb-2" />
          <h1 className="text-xl font-semibold text-white">
            EL&apos;ORAH ERP
          </h1>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-white text-sm mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded border border-white focus:outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-white text-sm mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded border border-white focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 border border-[#C9A24D] text-white font-medium rounded hover:bg-[#C9A24D] transition"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;