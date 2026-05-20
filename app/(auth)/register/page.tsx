/**
 * app/(auth)/register/page.tsx
 * Halaman registrasi user baru.
 *
 * TODO (Backend):
 * 1. Implementasi fungsi register menggunakan supabase.auth.signUp()
 * 2. Buat profil user di tabel user_profiles setelah signup berhasil
 * 3. Kirim email verifikasi (auto dari Supabase)
 * 4. Redirect ke /dashboard atau halaman "check your email"
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      /**
       * TODO (Backend): Ganti dengan Supabase Auth
       *
       * import { createClient } from "@/lib/supabase/client";
       * const supabase = createClient();
       * const { data, error } = await supabase.auth.signUp({
       *   email,
       *   password,
       *   options: { data: { full_name: fullName } }
       * });
       * if (error) throw error;
       *
       * // Buat profil user
       * await supabase.from("user_profiles").insert({
       *   id: data.user!.id,
       *   email,
       *   full_name: fullName,
       *   currency: "IDR",
       *   timezone: "Asia/Jakarta",
       * });
       *
       * toast.success("Account created! Check your email to verify.");
       * router.push("/login");
       */

      // Mock untuk development
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success("Account created! Welcome to Spendly 🎉");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    if (pass.length < 6) return { label: "Weak", color: "text-red-400", width: "25%" };
    if (pass.length < 8) return { label: "Fair", color: "text-amber-400", width: "50%" };
    if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass))
      return { label: "Good", color: "text-blue-400", width: "75%" };
    return { label: "Strong", color: "text-emerald-400", width: "100%" };
  };

  const strength = getPasswordStrength(password);

  return (
    <>
      <h2 className="font-display mb-1 text-2xl font-bold text-slate-100">
        Create your account
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Start tracking smarter, save more 💚
      </p>

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          type="text"
          placeholder="Rey Harmon"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          leftIcon={<User size={16} />}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<Lock size={16} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            autoComplete="new-password"
          />
          {/* Password strength bar */}
          {strength && (
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: strength.width,
                    backgroundColor:
                      strength.label === "Weak"
                        ? "#EF4444"
                        : strength.label === "Fair"
                        ? "#F59E0B"
                        : strength.label === "Good"
                        ? "#3B82F6"
                        : "#10B981",
                  }}
                />
              </div>
              <p className={`mt-1 text-xs ${strength.color}`}>
                Password strength: {strength.label}
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          leftIcon={<Lock size={16} />}
          autoComplete="new-password"
        />

        <p className="text-xs text-slate-600">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-emerald-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-emerald-400 hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
