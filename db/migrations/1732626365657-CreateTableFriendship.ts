import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableFriendship1732626365657 implements MigrationInterface {
  name = 'CreateTableFriendship1732626365657';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_friendship" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime DEFAULT (datetime('now')), "requesterId" integer, "addresseeId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_friendship"("id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId") SELECT "id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId" FROM "friendship"`,
    );
    await queryRunner.query(`DROP TABLE "friendship"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_friendship" RENAME TO "friendship"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_friendship" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime DEFAULT (datetime('now')), "requesterId" integer NOT NULL, "addresseeId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_friendship"("id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId") SELECT "id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId" FROM "friendship"`,
    );
    await queryRunner.query(`DROP TABLE "friendship"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_friendship" RENAME TO "friendship"`,
    );

    await queryRunner.query(
      `CREATE TABLE "temporary_friendship" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime DEFAULT (datetime('now')), "requesterId" integer NOT NULL, "addresseeId" integer NOT NULL, CONSTRAINT "FK_b29f15b88ee36453605ade63cb2" FOREIGN KEY ("requesterId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_8012340b570c83b55e0d3ef829a" FOREIGN KEY ("addresseeId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_friendship"("id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId") SELECT "id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId" FROM "friendship"`,
    );
    await queryRunner.query(`DROP TABLE "friendship"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_friendship" RENAME TO "friendship"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "friendship" RENAME TO "temporary_friendship"`,
    );
    await queryRunner.query(
      `CREATE TABLE "friendship" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime DEFAULT (datetime('now')), "requesterId" integer NOT NULL, "addresseeId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "friendship"("id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId") SELECT "id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId" FROM "temporary_friendship"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_friendship"`);

    await queryRunner.query(
      `ALTER TABLE "friendship" RENAME TO "temporary_friendship"`,
    );
    await queryRunner.query(
      `CREATE TABLE "friendship" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime DEFAULT (datetime('now')), "requesterId" integer, "addresseeId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "friendship"("id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId") SELECT "id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId" FROM "temporary_friendship"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_friendship"`);
    await queryRunner.query(
      `ALTER TABLE "friendship" RENAME TO "temporary_friendship"`,
    );
    await queryRunner.query(
      `CREATE TABLE "friendship" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime DEFAULT (datetime('now')), "requesterId" integer, "addresseeId" integer, CONSTRAINT "FK_b29f15b88ee36453605ade63cb2" FOREIGN KEY ("requesterId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "friendship"("id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId") SELECT "id", "status", "createdAt", "updatedAt", "requesterId", "addresseeId" FROM "temporary_friendship"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_friendship"`);
  }
}
