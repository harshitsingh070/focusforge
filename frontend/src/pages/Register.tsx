import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/login');
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="w-96 rounded-lg bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-2xl font-bold">Register</h2>

        {error && <p className="mb-3 text-red-500">{error}</p>}

        <input
          className="mb-3 w-full border p-2"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="mb-4 w-full border p-2"
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 p-2 text-white">
          Register
        </button>

        <p className="mt-3 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
