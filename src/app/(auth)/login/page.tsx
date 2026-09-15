"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-[400px] rounded-[12px] border border-[#262626] bg-[#141414] p-8 text-white">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#1a2332] text-[13px] font-semibold text-[#7eb6ff]">
            M
          </div>
          <p className="text-[15px] font-medium">mosmo</p>
        </div>
        <h1 className="mt-6 text-[24px] font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-[13px] text-[#8b8b8b]">
          Control plane — sign in with your provisioned credentials
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] text-[#8b8b8b]">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-[7px] border border-[#262626] bg-black px-3 py-2.5 text-[14px] outline-none focus:border-[#3b82f6aa] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] text-[#8b8b8b]">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-[7px] border border-[#262626] bg-black px-3 py-2.5 text-[14px] outline-none focus:border-[#3b82f6aa] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
            />
          </label>
          {error && <p className="text-[13px] text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[7px] bg-[#3b82f6] py-2.5 text-[14px] font-medium text-white hover:bg-[#2563eb] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
