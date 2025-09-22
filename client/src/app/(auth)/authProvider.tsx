"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGetAuthUserQuery } from "@/state/api";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const isAuthPage = !!pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/managers") || pathname.startsWith("/tenants");

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"tenant" | "manager">("tenant");
  const [error, setError] = useState("");

  // Wait for auth state before rendering anything
  if (isLoading) return <>Loading...</>;

  // Redirect rules after loading
  if (!authUser && isDashboardPage) {
    router.push("/signin");
    return null;
  }
  if (authUser && isAuthPage) {
    router.push("/"); 
    return null;
  }

  // Public pages
  if (!isAuthPage && !isDashboardPage) return <>{children}</>;


  if (isAuthPage) {
    const isSignUp = pathname.includes("signup");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSignUp && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const endpoint = `${apiBase}/api/auth/${isSignUp ? "signup" : "login"}`;

      const body: any = isSignUp
        ? { username, email, password, role }
        : { email, password };

      try {
        setError("");
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Authentication failed");
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Navigate after login/signup
        window.location.href = "/";
      } catch (err) {
        console.error("auth error:", err);
        setError("Something went wrong");
      }
    };

    return (
      <div className="max-w-md mx-auto mt-24 p-16 rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">
          RENT
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            AL
          </span>
        </h2>
        <p className="text-muted-foreground mb-4">
          {isSignUp
            ? "Create an account to continue"
            : "Welcome! Please sign in to continue"}
        </p>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="p-2 border border-gray-200 rounded bg-white focus:border-gray-400 focus:outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 border border-gray-200 rounded bg-white focus:border-gray-400 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 border border-gray-200 rounded bg-white focus:border-gray-400 focus:outline-none"
          />
          {isSignUp && (
            <>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="p-2 border border-gray-200 rounded bg-white focus:border-gray-400 focus:outline-none"
              />
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="tenant"
                    checked={role === "tenant"}
                    onChange={() => setRole("tenant")}
                    className="accent-primary-700"
                  />
                  Tenant
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={role === "manager"}
                    onChange={() => setRole("manager")}
                    className="accent-primary-700"
                  />
                  Manager
                </label>
              </div>
            </>
          )}
          <button
            type="submit"
            className="bg-primary-700 text-white p-2 rounded hover:bg-primary-600"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <div className="text-center mt-4">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => router.push("/signin")}
                className="text-primary hover:underline bg-transparent border-none p-0"
              >
                Sign in here
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-primary hover:underline bg-transparent border-none p-0"
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Dashboard pages
  return <>{children}</>;
};

export default Auth;
