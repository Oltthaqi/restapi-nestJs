import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterImage31732180781312 implements MigrationInterface {
  name = 'AlterImage31732180781312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_image" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "filepath" varchar NOT NULL, "universalId" integer NOT NULL, "universalType" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_image"("id", "filepath", "universalId", "universalType") SELECT "id", "filepath", "universalId", "universalType" FROM "image"`,
    );
    await queryRunner.query(`DROP TABLE "image"`);
    await queryRunner.query(`ALTER TABLE "temporary_image" RENAME TO "image"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" RENAME TO "temporary_image"`);
    await queryRunner.query(
      `CREATE TABLE "image" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "filepath" varchar NOT NULL, "universalId" integer NOT NULL, "universalType" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "image"("id", "filepath", "universalId", "universalType") SELECT "id", "filepath", "universalId", "universalType" FROM "temporary_image"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_image"`);
  }
}
