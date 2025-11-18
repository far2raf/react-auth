import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getGraphQLClient } from '../lib/graphql';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface DecodedToken {
  id: string;
}

const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
    }
  }
`;


export const AccountPage = () => {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (!token) {
        setError('Authentication token not found.');
        setIsLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const userId = decodedToken.id;
        const client = getGraphQLClient(token);
        const data = await client.request<{ user: User }>(GET_USER_QUERY, {
          id: userId,
        });
        if (isMounted) {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to fetch user details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return <div>Loading account details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h1>Account Details</h1>
      {user && (
        <>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>First Name:</strong> {user.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {user.lastName}
          </p>
        </>
      )}
      <button onClick={logout}>Log Out</button>
    </div>
  );
};
