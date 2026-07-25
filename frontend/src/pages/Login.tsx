import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN, SIGNUP } from '../graphql/queries';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [login, { loading: loginLoading }] = useMutation(LOGIN);
  const [signup, { loading: signupLoading }] = useMutation(SIGNUP);
  const isLoading = loginLoading || signupLoading;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    if (isSignup && !name.trim()) { setError('Please enter your name.'); return; }
    try {
      const result = isSignup
        ? await signup({ variables: { email, password, name } })
        : await login({ variables: { email, password } });
      const token = isSignup ? result.data.signup.token : result.data.login.token;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            M
          </div>
          <span className="text-white font-bold text-lg">MindFlow</span>
        </div>

        <h1 className="text-xl font-bold mb-1 text-center text-white">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          {isSignup ? 'Start chatting with AI in seconds' : 'Sign in to continue to MindFlow'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Full name</label>
              <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-60" />
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-60" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white py-3 rounded-xl font-medium transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isSignup ? 'Creating…' : 'Signing in…'}</>
            ) : (
              isSignup ? 'Create account' : 'Sign in'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-purple-400 hover:text-purple-300 font-medium">
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
