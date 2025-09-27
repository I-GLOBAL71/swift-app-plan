ALTER TABLE settings
ADD COLUMN hero_grid_alternates_premium_products BOOLEAN DEFAULT FALSE;

-- Grant access to the new column for authenticated users
GRANT SELECT (hero_grid_alternates_premium_products) ON settings TO authenticated;

-- Grant access to the new column for service_role users (for admin updates)
GRANT UPDATE (hero_grid_alternates_premium_products) ON settings TO service_role;