/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("in_flight", {
    id: "id",
    is_deposit_on_exchange: {
      type: "boolean",
      notNull: true,
      comment: "true: deposit on exchange | false: withdrawal from exchange",
    },
    address: { type: "varchar(64)", notNull: true },
    transfer_size_in_sats: { type: "bigint", notNull: true },
    memo: { type: "varchar(256)", notNull: false },
    is_completed: { type: "boolean", notNull: true },
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
  pgm.createIndex(
    "in_flight",
    // ["address", "transfer_size_in_sats", "is_completed"], ??
    ["is_deposit_on_exchange", "address", "transfer_size_in_sats", "is_completed"],
    {
      name: "in_flight_is_depo_addr_trans_idx",
    },
  )
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("in_flight", [], { name: "in_flight_is_depo_addr_trans_idx" })
  pgm.dropTable("in_flight", { ifExists: true, cascade: true })
}
