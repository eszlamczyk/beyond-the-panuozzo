import { Injectable } from '@nestjs/common';
import { FulfillmentResult } from './types/fulfillment-result';
import { UserManifest } from './types/user-manifest';
import { DPResult, DPContext } from './types/dp-types';

/**
 * Service responsible for determining the optimal order fulfillment strategy.
 * It uses Dynamic Programming with bitmasking to match users to food items
 * in a way that minimizes the number of unfulfilled (sacrificed) users
 * while maximizing the overall preference satisfaction (total score).
 */
@Injectable()
export class OrderMaterializationService {
  
  /**
   * Evaluates the provided user manifests to calculate the optimal food order combination.
   * Initializes the Dynamic Programming context, including memoization and the starting bitmask.
   *
   * @param manifests - An array containing user preferences and desired items.
   * @returns The final, formatted fulfillment result containing the optimal orders and list of sacrificed users.
   */
  optimize(manifests: UserManifest[]): FulfillmentResult {
    const context: DPContext = {
      manifests,
      memo: new Map<number, DPResult>(),
      mask: (1 << manifests.length) - 1,
    };

    const dpResult: DPResult = this.calculate(context);

    return this.formatFulfillment(dpResult);
  }

  /**
   * Core recursive Dynamic Programming function.
   * Evaluates the current state represented by the bitmask to find the optimal assignment 
   * for the next available user, either by assigning them a solo item, sacrificing them, 
   * or pairing them with another available user.
   *
   * @param ctx - The current DP context containing manifests, memoization map, and the state mask.
   * @returns The optimal DPResult for the current subproblem.
   */
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

    let bestResult = this.processSoloOrSacrifice(u1, u1Index, ctx);
    bestResult = this.processPairings(u1, u1Index, ctx, bestResult);

    ctx.memo.set(ctx.mask, bestResult);
    return bestResult;
  }

  /**
   * Processes the scenario where the primary user is either assigned their highest-preference
   * individual item (non-half) or is sacrificed if no standalone item is available.
   *
   * @param u1 - The target user manifest being processed.
   * @param u1Index - The index of the target user in the manifests array.
   * @param ctx - The current DP context.
   * @returns The best DPResult achieved by taking the solo or sacrifice path.
   */
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

  /**
   * Iterates through all remaining available users in the current state to find a valid pairing 
   * for the primary user. Compares these potential pairings against the current best result.
   *
   * @param u1 - The primary user manifest looking for a pair.
   * @param u1Index - The index of the primary user.
   * @param ctx - The current DP context.
   * @param currentBest - The best DPResult found so far for this state.
   * @returns The highest-yield DPResult after evaluating all possible pairing configurations.
   */
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

  /**
   * Compares the item manifests of two users to find an overlapping item 
   * that results in the highest combined preference score.
   *
   * @param u1 - The first user's manifest.
   * @param u2 - The second user's manifest.
   * @returns An object containing the optimal shared `foodId` and its `combinedScore`, or null if no overlap exists.
   */
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

  /**
   * Evaluates if a newly calculated DP outcome is superior to a previously established one.
   * The primary metric for "better" is fewer sacrificed users. 
   * In the event of a tie, the secondary metric is a higher total preference score.
   *
   * @param newRes - The newly proposed DPResult.
   * @param oldRes - The DPResult currently considered the best.
   * @returns True if `newRes` is strictly better than `oldRes`, otherwise false.
   */
  private isBetterResult(newRes: DPResult, oldRes: DPResult): boolean {
    if (newRes.sacrificedCount < oldRes.sacrificedCount) return true;
    return (
      newRes.sacrificedCount === oldRes.sacrificedCount &&
      newRes.totalScore > oldRes.totalScore
    );
  }

  /**
   * Converts the linked-list data structures generated during the DP execution 
   * into clean, flat arrays suitable for the final response payload.
   *
   * @param dpResult - The final, optimal DPResult outputted by the calculate function.
   * @returns A mapped FulfillmentResult object containing primitive arrays.
   */
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