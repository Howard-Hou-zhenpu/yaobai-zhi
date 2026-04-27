import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Scale } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('注册成功');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('登录成功');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <Card className="w-full max-w-[340px]">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
            <CardTitle className="text-2xl font-medium">摇摆志</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground italic">
            {isSignUp ? '创建账号，开始记录决策' : '登录账号，继续你的决策之旅'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label className="text-muted-foreground tracking-wide text-xs uppercase">邮箱</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="mt-2" />
            </div>
            <div>
              <Label className="text-muted-foreground tracking-wide text-xs uppercase">密码</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="mt-2" />
            </div>
            <Button type="submit" className="w-full rounded-2xl h-11" disabled={loading}>
              {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary hover:underline">
              {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
