"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    
    // login action redirects on success, so we only get here on error
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-blue">{t("login.title")}</h1>
        <p className="text-slate-500 mt-2">{t("login.subtitle")}</p>
      </div>

      <Card className="shadow-lg shadow-brand-blue/5 border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-orange" />
            {t("login.secureLogin")}
          </CardTitle>
          <CardDescription>
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@peter.com" 
                required 
                className="bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="bg-slate-50 focus:bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 mt-4 bg-gradient-to-r from-brand-orange to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-lg rounded-xl shadow-md shadow-brand-orange/20 transition-all"
            >
              {loading ? t("login.authenticating") : t("login.loginBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
