import type { OrderStatus } from '@btp/shared';
export type { OrderStatus };

export type Food = {
  id: string;
  name: string;
  price: number;
  typeId: string;
  typeName: string;
};

export type CreateFoodRequest = {
  name: string;
  price: number;
  typeId: string;
};

export type UpdateFoodRequest = {
  name?: string;
  price?: number;
  typeId?: string;
};

export type FoodType = {
  id: string;
  type: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type OrderItem = {
  id: string;
  userId: string;
  foodId: string;
  foodName?: string;
  size: 'half' | 'full';
};

export type Order = {
  id: string;
  status: OrderStatus;
  managerId: string;
  managerName?: string;
  items: OrderItem[];
};
