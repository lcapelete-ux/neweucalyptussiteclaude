import React, { useState } from "react";
import { X, Lock } from "lucide-react";
import { supabase } from "../supabase";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      // Show the specific error from Supabase to help the user debug
      if (err.message === "Invalid login credentials") {
        setError("E-mail ou senha incorretos.");
      } else if (err.message === "Email not confirmed") {
        setError("E-mail não confirmado. Verifique sua caixa de entrada ou desative a confirmação no Supabase.");
      } else {
        setError(err.message || "Erro ao tentar fazer login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-brand-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-stone-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-center text-stone-500 mb-8">
            Área de gestão de galerias e imagens. Entre com suas credenciais.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {!supabase && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-amber-700 text-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>Supabase não configurado no ambiente de produção.</span>
              </div>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
