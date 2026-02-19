import { queryOptions } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Food, FoodType, CreateFoodRequest, UpdateFoodRequest } from './types';

export function getFoods(): Promise<Food[]> {
  return apiFetch<Food[]>('/foods');
}

export function getFood(id: string): Promise<Food> {
  return apiFetch<Food>(`/foods/${id}`);
}

export function createFood(data: CreateFoodRequest): Promise<Food> {
  return apiFetch<Food>('/foods', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateFood(id: string, data: UpdateFoodRequest): Promise<Food> {
  return apiFetch<Food>(`/foods/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteFood(id: string): Promise<void> {
  return apiFetch<void>(`/foods/${id}`, {
    method: 'DELETE',
  });
}

export function getFoodTypes(): Promise<FoodType[]> {
  return apiFetch<FoodType[]>('/foods/types');
}

export function createFoodType(data: { type: string }): Promise<FoodType> {
  return apiFetch<FoodType>('/foods/types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateFoodType(
  id: string,
  data: { type: string },
): Promise<FoodType> {
  return apiFetch<FoodType>(`/foods/types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteFoodType(id: string): Promise<void> {
  return apiFetch<void>(`/foods/types/${id}`, {
    method: 'DELETE',
  });
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

export const foodTypesQueryOptions = queryOptions({
  queryKey: ['foodTypes'],
  queryFn: getFoodTypes,
});
