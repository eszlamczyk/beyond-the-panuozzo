import { Injectable } from '@nestjs/common';
import { FulfillmentResult } from './types/fulfillment-result';
import { UserManifest } from './types/user-manifest';
import { DPResult, DPContext } from './types/dp-types';

@Injectable()
export class OrderMaterializationService {
  optimize(manifests: UserManifest[]): FulfillmentResult {
    const context: DPContext = {
      manifests,
      memo: new Map<number, DPResult>(),
      mask: (1 << manifests.length) - 1,
    };

    const dpResult: DPResult = this.calculate(context);

    return this.formatFulfillment(dpResult);
  }

  private calculate(ctx: DPContext): DPResult {
    if (ctx.mask === 0)
      return {
        totalScore: 0,
        sacrificedCount: 0,
        ordersHead: null,
        sacrificedHead: null,
      };
    if (ctx.memo.has(ctx.mask)) return ctx.memo.get(ctx.mask)!;

    let u1Index = 0;
    while (!(ctx.mask & (1 << u1Index)) && u1Index < ctx.manifests.length) {
      u1Index++;
    }

    const u1 = ctx.manifests[u1Index]!;

    // Option A: Solo or Sacrifice
    let bestResult = this.processSoloOrSacrifice(u1, u1Index, ctx);

    // Option B: Pairings
    bestResult = this.processPairings(u1, u1Index, ctx, bestResult);

    ctx.memo.set(ctx.mask, bestResult);
    return bestResult;
  }

  private processSoloOrSacrifice(
    u1: UserManifest,
    u1Index: number,
    ctx: DPContext,
  ): DPResult {
    const subResult = this.calculate({
      ...ctx,
      mask: ctx.mask ^ (1 << u1Index),
    });

    let bestSoloItem = null;

    for (const item of u1.items) {
      if (!item.isHalf) {
        if (!bestSoloItem || item.preference > bestSoloItem.preference) {
          bestSoloItem = item;
        }
      }
    }

    if (bestSoloItem) {
      return {
        totalScore: bestSoloItem.preference + subResult.totalScore,
        sacrificedCount: subResult.sacrificedCount,
        ordersHead: {
          userId: u1.userId,
          foodId: bestSoloItem.foodId,
          next: subResult.ordersHead,
        },
        sacrificedHead: subResult.sacrificedHead,
      };
    }

    return {
      totalScore: subResult.totalScore,
      sacrificedCount: subResult.sacrificedCount + 1,
      ordersHead: subResult.ordersHead,
      sacrificedHead: { val: u1.userId, next: subResult.sacrificedHead },
    };
  }

  private processPairings(
    u1: UserManifest,
    u1Index: number,
    ctx: DPContext,
    currentBest: DPResult,
  ): DPResult {
    let best = currentBest;

    for (let u2Index = u1Index + 1; u2Index < ctx.manifests.length; u2Index++) {
      if (!(ctx.mask & (1 << u2Index))) continue;

      const u2 = ctx.manifests[u2Index]!;
      const sharedMatch = this.findBestSharedItem(u1, u2);

      if (sharedMatch) {
        const subResult = this.calculate({
          ...ctx,
          mask: ctx.mask ^ (1 << u1Index) ^ (1 << u2Index),
        });

        const potentialResult: DPResult = {
          totalScore: sharedMatch.combinedScore + subResult.totalScore,
          sacrificedCount: subResult.sacrificedCount,
          ordersHead: {
            userId: u1.userId,
            foodId: sharedMatch.foodId,
            next: {
              userId: u2.userId,
              foodId: sharedMatch.foodId,
              next: subResult.ordersHead,
            },
          },
          sacrificedHead: subResult.sacrificedHead,
        };

        if (this.isBetterResult(potentialResult, best)) {
          best = potentialResult;
        }
      }
    }
    return best;
  }

  // --- Helpers ---

  private findBestSharedItem(u1: UserManifest, u2: UserManifest) {
    let bestMatch = null;
    for (const item1 of u1.items) {
      const matchInU2 = u2.items.find((item2) => item2.foodId === item1.foodId);
      if (matchInU2) {
        const combinedScore = item1.preference + matchInU2.preference;
        if (!bestMatch || combinedScore > bestMatch.combinedScore) {
          bestMatch = { foodId: item1.foodId, combinedScore };
        }
      }
    }
    return bestMatch;
  }

  private isBetterResult(newRes: DPResult, oldRes: DPResult): boolean {
    if (newRes.sacrificedCount < oldRes.sacrificedCount) return true;
    return (
      newRes.sacrificedCount === oldRes.sacrificedCount &&
      newRes.totalScore > oldRes.totalScore
    );
  }

  private formatFulfillment(dpResult: DPResult): FulfillmentResult {
    const orders = [];
    let currOrder = dpResult.ordersHead;
    while (currOrder) {
      orders.push({ userId: currOrder.userId, foodId: currOrder.foodId });
      currOrder = currOrder.next;
    }

    const sacrificedUserIds = [];
    let currSacrificed = dpResult.sacrificedHead;
    while (currSacrificed) {
      sacrificedUserIds.push(currSacrificed.val);
      currSacrificed = currSacrificed.next;
    }

    return { totalScore: dpResult.totalScore, orders, sacrificedUserIds };
  }
}
