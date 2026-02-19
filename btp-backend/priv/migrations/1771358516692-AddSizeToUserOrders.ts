import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSizeToUserOrders1771358516692 implements MigrationInterface {
    name = 'AddSizeToUserOrders1771358516692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_orders" ADD "size" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_orders" DROP COLUMN "size"`);
    }

}
