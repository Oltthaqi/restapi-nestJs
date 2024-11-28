import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatetableblocksUsers1732699207496 implements MigrationInterface {
  name = 'CreatetableblocksUsers1732699207496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_blocks" ("userId" integer NOT NULL, "blockedId" integer NOT NULL, PRIMARY KEY ("userId", "blockedId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5126385b30cad06ee18038ab6" ON "user_blocks" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18d34df8212648b698828f244f" ON "user_blocks" ("blockedId") `,
    );

    await queryRunner.query(`DROP INDEX "IDX_e5126385b30cad06ee18038ab6"`);
    await queryRunner.query(`DROP INDEX "IDX_18d34df8212648b698828f244f"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_user_blocks" ("userId" integer NOT NULL, "blockedId" integer NOT NULL, CONSTRAINT "FK_e5126385b30cad06ee18038ab60" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_18d34df8212648b698828f244fb" FOREIGN KEY ("blockedId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("userId", "blockedId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_blocks"("userId", "blockedId") SELECT "userId", "blockedId" FROM "user_blocks"`,
    );
    await queryRunner.query(`DROP TABLE "user_blocks"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_blocks" RENAME TO "user_blocks"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5126385b30cad06ee18038ab6" ON "user_blocks" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18d34df8212648b698828f244f" ON "user_blocks" ("blockedId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_18d34df8212648b698828f244f"`);
    await queryRunner.query(`DROP INDEX "IDX_e5126385b30cad06ee18038ab6"`);
    await queryRunner.query(
      `ALTER TABLE "user_blocks" RENAME TO "temporary_user_blocks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_blocks" ("userId" integer NOT NULL, "blockedId" integer NOT NULL, PRIMARY KEY ("userId", "blockedId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "user_blocks"("userId", "blockedId") SELECT "userId", "blockedId" FROM "temporary_user_blocks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_user_blocks"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_18d34df8212648b698828f244f" ON "user_blocks" ("blockedId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5126385b30cad06ee18038ab6" ON "user_blocks" ("userId") `,
    );

    await queryRunner.query(`DROP INDEX "IDX_18d34df8212648b698828f244f"`);
    await queryRunner.query(`DROP INDEX "IDX_e5126385b30cad06ee18038ab6"`);
    await queryRunner.query(`DROP TABLE "user_blocks"`);
  }
}
