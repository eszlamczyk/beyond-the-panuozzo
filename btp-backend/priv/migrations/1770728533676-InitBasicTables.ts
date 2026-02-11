import { MigrationInterface, QueryRunner } from "typeorm";

export class InitBasicTables1770728533676 implements MigrationInterface {
    name = 'InitBasicTables1770728533676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "food_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, CONSTRAINT "PK_2e96981e13ce218ad84105a9ced" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "foods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" integer NOT NULL, "typeId" uuid, CONSTRAINT "PK_0cc83421325632f61fa27a52b59" PRIMARY KEY ("id")); COMMENT ON COLUMN "foods"."price" IS 'Price in \`grosze\`'`);
        await queryRunner.query(`CREATE TABLE "user_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "orderId" uuid, "food_id" uuid, CONSTRAINT "PK_753da927c0c469cc6646133b213" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" smallint NOT NULL DEFAULT '0', "managerId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")); COMMENT ON COLUMN "orders"."status" IS '0=Draft, 1=To_order, 2= Ordered, 3=Eaten'`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "foods" ADD CONSTRAINT "FK_44c2338b924dddbe0fbba9c8674" FOREIGN KEY ("typeId") REFERENCES "food_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_orders" ADD CONSTRAINT "FK_b013d464f92c16e206fba81acc2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_orders" ADD CONSTRAINT "FK_796954566c80ada8cefea592e72" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_orders" ADD CONSTRAINT "FK_6fed11dd3b9cd7f1c64a5f4c61d" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_3f30dcd69f06f473c7bb510d11c" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_3f30dcd69f06f473c7bb510d11c"`);
        await queryRunner.query(`ALTER TABLE "user_orders" DROP CONSTRAINT "FK_6fed11dd3b9cd7f1c64a5f4c61d"`);
        await queryRunner.query(`ALTER TABLE "user_orders" DROP CONSTRAINT "FK_796954566c80ada8cefea592e72"`);
        await queryRunner.query(`ALTER TABLE "user_orders" DROP CONSTRAINT "FK_b013d464f92c16e206fba81acc2"`);
        await queryRunner.query(`ALTER TABLE "foods" DROP CONSTRAINT "FK_44c2338b924dddbe0fbba9c8674"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "user_orders"`);
        await queryRunner.query(`DROP TABLE "foods"`);
        await queryRunner.query(`DROP TABLE "food_type"`);
    }

}
