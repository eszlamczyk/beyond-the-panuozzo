import { queryOptions } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { User } from './types';

export function getUsers(): Promise<User[]> {
  return apiFetch<User[]>('/users');
}

export function getUser(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

export const usersQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: getUsers,
});

export const userQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
  });
