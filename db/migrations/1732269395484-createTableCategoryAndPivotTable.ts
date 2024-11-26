import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableCategoryAndPivotTable1732269395484
  implements MigrationInterface
{
  name = 'CreateTableCategoryAndPivotTable1732269395484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "postscategories" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, PRIMARY KEY ("postId", "categoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90d4c953715d44a44c10e258ff" ON "postscategories" ("postId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fa6a06f023047435dd71125f8" ON "postscategories" ("categoryId") `,
    );

    await queryRunner.query(`DROP INDEX "IDX_90d4c953715d44a44c10e258ff"`);
    await queryRunner.query(`DROP INDEX "IDX_9fa6a06f023047435dd71125f8"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_postscategories" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "FK_90d4c953715d44a44c10e258ffc" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_9fa6a06f023047435dd71125f82" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("postId", "categoryId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_postscategories"("postId", "categoryId") SELECT "postId", "categoryId" FROM "postscategories"`,
    );
    await queryRunner.query(`DROP TABLE "postscategories"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_postscategories" RENAME TO "postscategories"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90d4c953715d44a44c10e258ff" ON "postscategories" ("postId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fa6a06f023047435dd71125f8" ON "postscategories" ("categoryId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_9fa6a06f023047435dd71125f8"`);
    await queryRunner.query(`DROP INDEX "IDX_90d4c953715d44a44c10e258ff"`);
    await queryRunner.query(
      `ALTER TABLE "postscategories" RENAME TO "temporary_postscategories"`,
    );
    await queryRunner.query(
      `CREATE TABLE "postscategories" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, PRIMARY KEY ("postId", "categoryId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "postscategories"("postId", "categoryId") SELECT "postId", "categoryId" FROM "temporary_postscategories"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_postscategories"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9fa6a06f023047435dd71125f8" ON "postscategories" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90d4c953715d44a44c10e258ff" ON "postscategories" ("postId") `,
    );

    await queryRunner.query(`DROP INDEX "IDX_9fa6a06f023047435dd71125f8"`);
    await queryRunner.query(`DROP INDEX "IDX_90d4c953715d44a44c10e258ff"`);
    await queryRunner.query(`DROP TABLE "postscategories"`);
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
