import { ApiProperty } from '@nestjs/swagger';
import { PanuozzoSize } from '../../panuozzo-size.enum';
import { WishlistItem } from '../../domain/wishlist.model';

export class WishlistResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty({ enum: PanuozzoSize })
  size!: PanuozzoSize;

  @ApiProperty()
  foodId!: string;

  @ApiProperty()
  foodName?: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  userId!: string;

  static fromDomain(item: WishlistItem): WishlistResponseDto {
    const dto = new WishlistResponseDto();
    dto.id = item.id;
    dto.rating = item.rating;
    dto.size = item.size;
    dto.foodId = item.foodId;
    dto.foodName = item.foodName;
    dto.orderId = item.orderId;
    dto.userId = item.userId;
    return dto;
  }
}
