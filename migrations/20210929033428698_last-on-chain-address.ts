/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("last_on_chain_address", {
    id: "id",
    json_data: { type: "json", notNull: true },
    updated_timestamp: {
      type: "varchar(256)",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    created_timestamp: {
      type: "varchar(256)",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("last_on_chain_address", { ifExists: true, cascade: true })
}
