import { queryOptions } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Food } from './types';

export function getFoods(): Promise<Food[]> {
  return apiFetch<Food[]>('/foods');
}

export function getFood(id: string): Promise<Food> {
  return apiFetch<Food>(`/foods/${id}`);
}

export const foodsQueryOptions = queryOptions({
  queryKey: ['foods'],
  queryFn: getFoods,
});

export const foodQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['foods', id],
    queryFn: () => getFood(id),
  });
