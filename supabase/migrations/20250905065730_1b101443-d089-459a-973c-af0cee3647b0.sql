-- Allow public users to create orders without authentication
CREATE POLICY "Public can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Allow public users to create order items without authentication  
CREATE POLICY "Public can create order items"
ON public.order_items
FOR INSERT 
WITH CHECK (true);