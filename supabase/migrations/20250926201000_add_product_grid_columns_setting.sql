INSERT INTO settings (key, value)
VALUES ('product_grid_columns', '3')
ON CONFLICT (key) DO NOTHING;