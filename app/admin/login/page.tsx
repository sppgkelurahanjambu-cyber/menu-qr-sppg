"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => {
      if (data?.claims) router.replace("/admin");
    });
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage("Email atau password salah.");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") || "/admin";
    router.replace(next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-logo">🔐</div>
        <p className="eyebrow">SPPG SEMARANG JAMBU JAMBU 02</p>
        <h1>Login Admin</h1>
        <p className="admin-login-subtitle">
          Masuk untuk mengelola foto menu dari HP atau komputer.
        </p>

        <form onSubmit={handleLogin} className="admin-login-form">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email admin"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password admin"
            required
          />

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Memeriksa..." : "Masuk"}
          </button>

          {message && <p className="login-error">{message}</p>}
        </form>

        <a href="/" className="back-button login-back">
          ← Kembali ke halaman publik
        </a>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="admin-login-page"><section className="admin-login-card"><h1>Login Admin</h1><p>Memuat...</p></section></main>}>
      <LoginForm />
    </Suspense>
  );
}
