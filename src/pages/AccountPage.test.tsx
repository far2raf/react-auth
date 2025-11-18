import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AccountPage } from './AccountPage.tsx';
import { useAuth,  type AuthContextType } from '../context/AuthContext';
import type { GraphQLClient } from 'graphql-request';
import { getGraphQLClient } from '../lib/graphql';
import { jwtDecode } from 'jwt-decode';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

vi.mock('../lib/graphql', () => ({
  getGraphQLClient: vi.fn(() => ({
    request: vi.fn(),
  })),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetGraphQLClient = vi.mocked(getGraphQLClient);
const mockedJwtDecode = vi.mocked(jwtDecode);

const createMockAuthContext = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  token: 'fake-token',
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
  ...overrides,
});

describe('AccountPage', () => {
  const mockLogout = vi.fn();
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(() => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({ logout: mockLogout })
    );
    mockedJwtDecode.mockReturnValue({ id: '1' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display a loading message initially and then the user details', async () => {
    const mockRequest = vi.fn().mockResolvedValue({ user: mockUser });
    mockedGetGraphQLClient.mockReturnValue({
      request: mockRequest,
    } as unknown as GraphQLClient);

    render(<AccountPage />);

    expect(screen.getByText('Loading account details...')).toBeInTheDocument();
    expect(await screen.findByText('Account Details')).toBeInTheDocument();
  });

  it('should display user details on successful fetch', async () => {
    const mockRequest = vi.fn().mockResolvedValue({ user: mockUser });
    mockedGetGraphQLClient.mockReturnValue({
      request: mockRequest,
    } as unknown as GraphQLClient);

    render(<AccountPage />);

    expect(await screen.findByText('Account Details')).toBeInTheDocument();
    expect(screen.getByText(mockUser.id)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.firstName)).toBeInTheDocument();
    expect(screen.getByText(mockUser.lastName)).toBeInTheDocument();
  });

  it('should display an error message on fetch failure', async () => {
    const mockRequest = vi.fn().mockRejectedValue(new Error('Fetch failed'));
    mockedGetGraphQLClient.mockReturnValue({
      request: mockRequest,
    } as unknown as GraphQLClient);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<AccountPage />);

    const errorMessage = await screen.findByText('Failed to fetch user details.');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: 'rgb(255, 0, 0)' });

    consoleErrorSpy.mockRestore();
  });

  it('should display an error if no token is provided', async () => {

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({ token: null, isAuthenticated: false, logout: mockLogout })
    );

    render(<AccountPage />);

    const errorMessage = await screen.findByText(
      'Authentication token not found.'
    );
    expect(errorMessage).toBeInTheDocument();
  });
});