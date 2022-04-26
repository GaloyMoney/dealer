-- Up Migration
CREATE AGGREGATE mul(decimal) ( SFUNC = numeric_mul, STYPE=decimal );

-- Down Migration
DROP AGGREGATE IF EXISTS mul(decimal);
