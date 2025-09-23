CREATE TYPE similar_products_mode AS ENUM ('auto', 'manual');

ALTER TABLE products
ADD COLUMN similar_products_type similar_products_mode NOT NULL DEFAULT 'auto';

CREATE TABLE product_relations (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    similar_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, similar_product_id)
);

-- Optional: Add an index for faster lookups
CREATE INDEX idx_product_relations_product_id ON product_relations(product_id);

-- RLS policies for the new table
ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to product relations"
ON product_relations
FOR SELECT
USING (true);

CREATE POLICY "Allow admin users to manage product relations"
ON product_relations
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');