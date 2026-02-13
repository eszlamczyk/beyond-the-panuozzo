import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokens1770977331566 implements MigrationInterface {
    name = 'AddRefreshTokens1770977331566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "googleId" character varying NOT NULL, "email" character varying NOT NULL, "displayName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "family" character varying NOT NULL, CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_refresh_tokens_tokenHash" ON "refresh_tokens" ("tokenHash")`);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_googleId" ON "refresh_tokens" ("googleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_family" ON "refresh_tokens" ("family")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_family"`);
        await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_googleId"`);
        await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_tokenHash"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
