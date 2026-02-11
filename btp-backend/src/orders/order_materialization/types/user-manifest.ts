export interface UserManifest {
  userId: string;
  items: {
    foodId: string;
    isHalf: boolean;
    preference: number;
  }[];
}
