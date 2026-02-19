import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCapabilityToRefreshTokens1771500000000 implements MigrationInterface {
    name = 'AddCapabilityToRefreshTokens1771500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "capability" character varying NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "capability"`);
    }

}
