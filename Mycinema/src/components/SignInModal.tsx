import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft, User } from "lucide-react";

type AuthMode = "login" | "signup";
type AuthUser = { name: string; email: string };

const SignInModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: AuthUser) => void }) => {
  const [mode, setMode] = useState<AuthMode>("login"); // ← always starts on login
  const [step, setStep] = useState<"email" | "name" | "password">("email");
  const [formData, setFormData] = useState({ email: "", name: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const nameValid = formData.name.trim().length >= 2;
  const pwValid = formData.password.length >= 6;

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep("email");
    setFormData({ email: "", name: "", password: "" });
  };

  const handleNext = () => {
    if (step === "email" && emailValid) setStep(mode === "login" ? "password" : "name");
    else if (step === "name" && nameValid) setStep("password");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSuccess({ name: mode === "signup" ? formData.name : (data.user?.name || "User"), email: formData.email });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const Input = ({ icon: Icon, ...props }: any) => (
    <div className="relative mb-4">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
      <input {...props} className="w-full bg-white/5 border border-white/10 focus:border-[#F84464] rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none transition-all" />
    </div>
  );

  const stepTitle = step === "email"
    ? (mode === "login" ? "Welcome back" : "Create account")
    : step === "name" ? "Your name" : "Set password";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-[380px] bg-[#0d0d0d] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-[#F84464] to-[#ff6b85]" />
        <div className="p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="font-black tracking-tighter text-lg text-white">
              my<span className="text-[#F84464]">Cinema</span>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Back button */}
          {step !== "email" && (
            <button
              onClick={() => setStep(step === "password" && mode === "signup" ? "name" : "email")}
              className="flex items-center gap-2 text-xs text-gray-500 mb-4 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}

          <h2 className="text-xl font-black text-white mb-6">{stepTitle}</h2>

          {step === "email" && (
            <Input
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              autoFocus
            />
          )}
          {step === "name" && (
            <Input
              icon={User}
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          )}
          {step === "password" && (
            <div className="relative">
              <Input
                icon={Lock}
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                autoFocus
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-4 text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <button
            onClick={step === "password" ? handleSubmit : handleNext}
            disabled={
              loading ||
              (step === "email" && !emailValid) ||
              (step === "name" && !nameValid) ||
              (step === "password" && !pwValid)
            }
            className="w-full py-3.5 bg-[#F84464] text-white rounded-xl font-black text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? "Please wait..." : step === "password" ? (mode === "login" ? "Sign In" : "Create Account") : "Continue"}
          </button>

          {/* Mode toggle — only on email step */}
          {step === "email" && (
            <p className="text-center mt-6 text-xs text-gray-500">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => switchMode("signup")} className="text-[#F84464] font-bold hover:underline">
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already a member?{" "}
                  <button onClick={() => switchMode("login")} className="text-[#F84464] font-bold hover:underline">
                    Login
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInModal;