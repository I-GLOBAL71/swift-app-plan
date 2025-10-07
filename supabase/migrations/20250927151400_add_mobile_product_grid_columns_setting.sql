INSERT INTO settings (key, value)
VALUES ('mobile_product_grid_columns', '1')
ON CONFLICT (key) DO NOTHING;