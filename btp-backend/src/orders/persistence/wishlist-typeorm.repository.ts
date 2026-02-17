import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from '../domain/wishlist.model';
import { WishlistRepositoryPort } from '../domain/wishlist-repository.port';
import { WishlistEntity } from './wishlist.entity';
import { WishlistMapper } from './wishlist.mapper';

@Injectable()
export class WishlistTypeOrmRepository extends WishlistRepositoryPort {
  constructor(
    @InjectRepository(WishlistEntity)
    private readonly repo: Repository<WishlistEntity>,
  ) {
    super();
  }

  async create(
    item: Omit<WishlistItem, 'id' | 'foodName'>,
  ): Promise<WishlistItem> {
    const entity = this.repo.create({
      rating: item.rating,
      size: item.size,
      user: { id: item.userId },
      food: { id: item.foodId },
      order: { id: item.orderId },
    });

    const saved = await this.repo.save(entity);
    return WishlistMapper.toDomain(saved);
  }

  async findByOrder(orderId: string): Promise<WishlistItem[]> {
    const entities = await this.repo.find({
      where: { order: { id: orderId } },
      relations: ['food', 'user', 'order'],
    });
    return entities.map((entity) => WishlistMapper.toDomain(entity));
  }

  async updateRating(id: string, rating: number): Promise<WishlistItem> {
    const entity = await this.repo.preload({ id, rating });
    if (!entity) {
      throw new NotFoundException(`Wishlist item with ID "${id}" not found`);
    }
    const saved = await this.repo.save(entity);
    return WishlistMapper.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Wishlist item with ID "${id}" not found`);
    }
  }
}
