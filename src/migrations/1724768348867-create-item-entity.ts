import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemEntity1724768348867 implements MigrationInterface {
  name = 'CreateItemEntity1724768348867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "listing" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "description" varchar NOT NULL, "rating" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "itemId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "listingId" integer, CONSTRAINT "REL_d989034b34992567ecb91ea60a" UNIQUE ("listingId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "item_tags_tag" ("itemId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("itemId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5054f98dd0c65e7fe5be4e2660" ON "item_tags_tag" ("itemId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3d7c2df025e808ef2cbd12286" ON "item_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "itemId" integer, CONSTRAINT "FK_d7846a91e6eb1ddcef861577e02" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_comment"("id", "content", "itemId") SELECT "id", "content", "itemId" FROM "comment"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_comment" RENAME TO "comment"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "listingId" integer, CONSTRAINT "REL_d989034b34992567ecb91ea60a" UNIQUE ("listingId"), CONSTRAINT "FK_d989034b34992567ecb91ea60a5" FOREIGN KEY ("listingId") REFERENCES "listing" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item"("id", "name", "listingId") SELECT "id", "name", "listingId" FROM "item"`,
    );
    await queryRunner.query(`DROP TABLE "item"`);
    await queryRunner.query(`ALTER TABLE "temporary_item" RENAME TO "item"`);
    await queryRunner.query(`DROP INDEX "IDX_5054f98dd0c65e7fe5be4e2660"`);
    await queryRunner.query(`DROP INDEX "IDX_b3d7c2df025e808ef2cbd12286"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_item_tags_tag" ("itemId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "FK_5054f98dd0c65e7fe5be4e2660c" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_b3d7c2df025e808ef2cbd12286b" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("itemId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_tags_tag"("itemId", "tagId") SELECT "itemId", "tagId" FROM "item_tags_tag"`,
    );
    await queryRunner.query(`DROP TABLE "item_tags_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_tags_tag" RENAME TO "item_tags_tag"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5054f98dd0c65e7fe5be4e2660" ON "item_tags_tag" ("itemId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3d7c2df025e808ef2cbd12286" ON "item_tags_tag" ("tagId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_b3d7c2df025e808ef2cbd12286"`);
    await queryRunner.query(`DROP INDEX "IDX_5054f98dd0c65e7fe5be4e2660"`);
    await queryRunner.query(
      `ALTER TABLE "item_tags_tag" RENAME TO "temporary_item_tags_tag"`,
    );
    await queryRunner.query(
      `CREATE TABLE "item_tags_tag" ("itemId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("itemId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "item_tags_tag"("itemId", "tagId") SELECT "itemId", "tagId" FROM "temporary_item_tags_tag"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_item_tags_tag"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_b3d7c2df025e808ef2cbd12286" ON "item_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5054f98dd0c65e7fe5be4e2660" ON "item_tags_tag" ("itemId") `,
    );
    await queryRunner.query(`ALTER TABLE "item" RENAME TO "temporary_item"`);
    await queryRunner.query(
      `CREATE TABLE "item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "listingId" integer, CONSTRAINT "REL_d989034b34992567ecb91ea60a" UNIQUE ("listingId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "item"("id", "name", "listingId") SELECT "id", "name", "listingId" FROM "temporary_item"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_item"`);
    await queryRunner.query(
      `ALTER TABLE "comment" RENAME TO "temporary_comment"`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "itemId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "comment"("id", "content", "itemId") SELECT "id", "content", "itemId" FROM "temporary_comment"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_comment"`);
    await queryRunner.query(`DROP INDEX "IDX_b3d7c2df025e808ef2cbd12286"`);
    await queryRunner.query(`DROP INDEX "IDX_5054f98dd0c65e7fe5be4e2660"`);
    await queryRunner.query(`DROP TABLE "item_tags_tag"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "item"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "listing"`);
  }
}
