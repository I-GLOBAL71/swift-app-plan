CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON payment_methods FOR ALL USING (auth.role() = 'service_role');

-- Insert default payment methods
INSERT INTO payment_methods (name, enabled) VALUES
('Cash on Delivery', true),
('Credit Card', false),
('CoolPay', true),
('LygosPay', true);