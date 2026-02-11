import type { UserManifest } from './user-manifest';

export interface OrderNode {
  userId: string;
  foodId: string;
  next: OrderNode | null;
}

export interface SacrificedNode {
  val: string;
  next: SacrificedNode | null;
}

export interface DPResult {
  totalScore: number;
  sacrificedCount: number;
  ordersHead: OrderNode | null;
  sacrificedHead: SacrificedNode | null;
}

export interface DPContext {
  mask: number;
  manifests: UserManifest[];
  memo: Map<number, DPResult>;
}
