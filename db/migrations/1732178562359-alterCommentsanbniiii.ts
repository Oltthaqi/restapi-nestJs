import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCommentsanbniiii1732178562359 implements MigrationInterface {
  name = 'AlterCommentsanbniiii1732178562359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "image" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "filepath" varchar NOT NULL, "universalId" integer NOT NULL, "universalType" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "like" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "univesalId" integer NOT NULL, "universalType" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "accountStatus" varchar NOT NULL DEFAULT ('inactive'), "emailVerifiedAt" datetime, "isVerified" boolean NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "likes" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "comment" varchar NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, "commentId" integer, "likes" integer, "repliesCount" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "token" varchar NOT NULL, "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "type" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_like" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "univesalId" integer NOT NULL, "universalType" varchar NOT NULL, CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_like"("id", "userId", "univesalId", "universalType") SELECT "id", "userId", "univesalId", "universalType" FROM "like"`,
    );
    await queryRunner.query(`DROP TABLE "like"`);
    await queryRunner.query(`ALTER TABLE "temporary_like" RENAME TO "like"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "likes" integer NOT NULL, CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_post"("id", "title", "content", "createdAt", "userId", "likes") SELECT "id", "title", "content", "createdAt", "userId", "likes" FROM "post"`,
    );
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "comment" varchar NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, "commentId" integer, "likes" integer, "repliesCount" integer, CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_comment"("id", "comment", "userId", "postId", "commentId", "likes", "repliesCount") SELECT "id", "comment", "userId", "postId", "commentId", "likes", "repliesCount" FROM "comment"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_comment" RENAME TO "comment"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_verification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "token" varchar NOT NULL, "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "type" varchar NOT NULL, CONSTRAINT "FK_8300048608d8721aea27747b07a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_verification"("id", "userId", "token", "expiresAt", "createdAt", "type") SELECT "id", "userId", "token", "expiresAt", "createdAt", "type" FROM "verification"`,
    );
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_verification" RENAME TO "verification"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "verification" RENAME TO "temporary_verification"`,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "token" varchar NOT NULL, "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "type" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "verification"("id", "userId", "token", "expiresAt", "createdAt", "type") SELECT "id", "userId", "token", "expiresAt", "createdAt", "type" FROM "temporary_verification"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_verification"`);
    await queryRunner.query(
      `ALTER TABLE "comment" RENAME TO "temporary_comment"`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "comment" varchar NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, "commentId" integer, "likes" integer, "repliesCount" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "comment"("id", "comment", "userId", "postId", "commentId", "likes", "repliesCount") SELECT "id", "comment", "userId", "postId", "commentId", "likes", "repliesCount" FROM "temporary_comment"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_comment"`);
    await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
    await queryRunner.query(
      `CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "likes" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "post"("id", "title", "content", "createdAt", "userId", "likes") SELECT "id", "title", "content", "createdAt", "userId", "likes" FROM "temporary_post"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_post"`);
    await queryRunner.query(`ALTER TABLE "like" RENAME TO "temporary_like"`);
    await queryRunner.query(
      `CREATE TABLE "like" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "univesalId" integer NOT NULL, "universalType" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "like"("id", "userId", "univesalId", "universalType") SELECT "id", "userId", "univesalId", "universalType" FROM "temporary_like"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_like"`);
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "like"`);
    await queryRunner.query(`DROP TABLE "image"`);
  }
}
