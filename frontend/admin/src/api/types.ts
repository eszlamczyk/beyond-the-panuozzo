export type Food = {
  id: string;
  name: string;
  price: number;
  typeName?: string;
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

export type OrderStatus = 0 | 1 | 2 | 3;

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
