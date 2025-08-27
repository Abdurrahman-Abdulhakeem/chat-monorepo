"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";
import { LoginSchema } from "@/lib/schemas";


type LoginFormInputs = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login, error } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (values: LoginFormInputs) => {
      const user = await login(values);
      if (user) router.replace("/chat");
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm bg-white/5 rounded-3xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 focus:outline-none"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 focus:outline-none"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Continue"}
          </button>
        </form>

        <Link href="/register" className="text-sm opacity-80">
          Create an account →
        </Link>
      </div>
    </main>
  );
}
