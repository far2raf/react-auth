import { useState, type FormEvent } from 'react';
import { gql } from 'graphql-request';
import { useAuth } from '../context/AuthContext.tsx';
import { getGraphQLClient } from '../lib/graphql.ts';
import { useNavigate } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const client = getGraphQLClient();
      const data = await client.request<{ login: { jwt: string } }>(LOGIN_MUTATION, { identifier: email, password: password });
      const token = data?.login.jwt;

      if (token) {
        login(token);
        navigate('/account');
      } else {
        throw new Error('Login failed: No token received.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};