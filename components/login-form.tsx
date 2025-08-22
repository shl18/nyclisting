"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const { email, password } = data;

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw authError;
      }

      if (authData?.session) {
        let retries = 0;
        const maxRetries = 5;

        while (retries < maxRetries) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            toast({
              title: "Logged in!",
              description: "Welcome back to NYC Listings.",
            });

            router.replace("/profile");
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          retries++;
        }

        throw new Error("Failed to establish session");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
      toast({
        title: "Login failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register("email")}
          className={cn(
            "mt-1",
            errors.email && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            {...register("password")}
            className={cn(
              "mt-1",
              errors.password && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          <button
            type="button"
            className="absolute right-3 top-[60%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800"
          />
          <Label htmlFor="remember" className="ml-2 text-sm text-gray-600">
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-blue-800 hover:text-blue-900"
        >
          Forgot Password?
        </Link>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
