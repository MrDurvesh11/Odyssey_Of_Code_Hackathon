"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, GitHub, Google, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate authentication - would connect to an actual auth service in a real app
      if (email === "demo@example.com" && password === "password") {
        // Simulate a delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to dashboard after successful login
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. Try demo@example.com / password.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-950 rounded-lg shadow-lg border">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center">
                <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">RFP AI</span>
              </div>
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="flex p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" type="button">
                <Google className="h-4 w-4 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="w-full" type="button">
                <GitHub className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>
          </form>

          <div className="text-center mt-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2023 RFP AI. All rights reserved.
      </footer>
    </div>
  );
}
