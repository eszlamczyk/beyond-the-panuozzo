import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWishlist1770814059761 implements MigrationInterface {
    name = 'AddWishlist1770814059761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wishlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "foodId" uuid, "userId" uuid, "orderId" uuid, CONSTRAINT "CHK_1e57c5e826dd868ed462382645" CHECK ("rating" >= 1 AND "rating" <= 5), CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_8e922701fe8111622f7e67a3a0e" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_68a528ce7b756880876cf50d9c6" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_68a528ce7b756880876cf50d9c6"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_8e922701fe8111622f7e67a3a0e"`);
        await queryRunner.query(`DROP TABLE "wishlist"`);
    }

}
