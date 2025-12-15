-- LastPlate Production Database Schema
-- Version: 1.0.0
-- Date: 2025-12-14

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'manager', 'regional_manager', 'admin', 'owner')),
    location_id UUID,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- LOCATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    phone TEXT,
    email TEXT,
    manager_id UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    reorder_point DECIMAL(10, 2) NOT NULL DEFAULT 0,
    reorder_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    expiration_date DATE,
    barcode TEXT,
    sku TEXT,
    supplier_id UUID,
    notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    delivery_time_avg INTEGER DEFAULT 0, -- in days
    payment_terms TEXT,
    tax_id TEXT,
    website TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VENDOR CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PURCHASE ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id),
    location_id UUID NOT NULL REFERENCES public.locations(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PURCHASE ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id),
    item_name TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    received_quantity DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ESG REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.esg_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES public.locations(id),
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual')),
    
    -- Environmental metrics
    food_waste_kg DECIMAL(10, 2) DEFAULT 0,
    food_waste_cost DECIMAL(10, 2) DEFAULT 0,
    energy_consumption_kwh DECIMAL(10, 2) DEFAULT 0,
    water_consumption_gallons DECIMAL(10, 2) DEFAULT 0,
    recycling_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Social metrics
    employee_count INTEGER DEFAULT 0,
    training_hours DECIMAL(10, 2) DEFAULT 0,
    safety_incidents INTEGER DEFAULT 0,
    
    -- Governance metrics
    compliance_score DECIMAL(5, 2) DEFAULT 0,
    audit_findings INTEGER DEFAULT 0,
    
    notes TEXT,
    generated_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE BASE CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kb_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.kb_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE BASE ARTICLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.kb_categories(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    tags TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_location_id ON public.users(location_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Locations
CREATE INDEX IF NOT EXISTS idx_locations_manager_id ON public.locations(manager_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON public.locations(is_active);

-- Inventory Items
CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON public.inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON public.inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_items(sku);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON public.vendors(rating);

-- Purchase Orders
CREATE INDEX IF NOT EXISTS idx_po_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_location_id ON public.purchase_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_order_date ON public.purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_po_created_by ON public.purchase_orders(created_by);

-- ESG Reports
CREATE INDEX IF NOT EXISTS idx_esg_location_id ON public.esg_reports(location_id);
CREATE INDEX IF NOT EXISTS idx_esg_period ON public.esg_reports(report_period_start, report_period_end);

-- Knowledge Base
CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON public.kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON public.kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON public.kb_articles(slug);

-- Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Locations policies (staff can read their location, managers can read/update)
CREATE POLICY "Users can read their location" ON public.locations
    FOR SELECT USING (
        id IN (SELECT location_id FROM public.users WHERE id = auth.uid())
        OR manager_id = auth.uid()
    );

CREATE POLICY "Managers can update their location" ON public.locations
    FOR UPDATE USING (manager_id = auth.uid());

-- Inventory policies (location-based access)
CREATE POLICY "Users can read inventory for their location" ON public.inventory_items
    FOR SELECT USING (
        location_id IN (SELECT location_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Staff can insert inventory" ON public.inventory_items
    FOR INSERT WITH CHECK (
        location_id IN (SELECT location_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Staff can update inventory" ON public.inventory_items
    FOR UPDATE USING (
        location_id IN (SELECT location_id FROM public.users WHERE id = auth.uid())
    );

-- Vendors policies (all authenticated users can read)
CREATE POLICY "Authenticated users can read vendors" ON public.vendors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage vendors" ON public.vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'regional_manager', 'admin', 'owner')
        )
    );

-- Purchase Orders policies
CREATE POLICY "Users can read POs for their location" ON public.purchase_orders
    FOR SELECT USING (
        location_id IN (SELECT location_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Staff can create POs" ON public.purchase_orders
    FOR INSERT WITH CHECK (
        location_id IN (SELECT location_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Staff can update their POs" ON public.purchase_orders
    FOR UPDATE USING (
        created_by = auth.uid() OR
        location_id IN (
            SELECT location_id FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'regional_manager', 'admin', 'owner')
        )
    );

-- Knowledge Base policies (public read, admin write)
CREATE POLICY "Anyone can read published articles" ON public.kb_articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage articles" ON public.kb_articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- Audit log policies (read-only for admins)
CREATE POLICY "Admins can read audit log" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esg_reports_updated_at BEFORE UPDATE ON public.esg_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_categories_updated_at BEFORE UPDATE ON public.kb_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at BEFORE UPDATE ON public.kb_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Insert default location
INSERT INTO public.locations (id, name, address, city, state, zip_code)
VALUES (
    'default'::uuid,
    'Main Location',
    '123 Main St',
    'San Francisco',
    'CA',
    '94102'
) ON CONFLICT (id) DO NOTHING;

-- Insert KB categories
INSERT INTO public.kb_categories (name, slug, description, icon) VALUES
    ('Getting Started', 'getting-started', 'Learn the basics', 'rocket'),
    ('Inventory Management', 'inventory', 'Managing your inventory', 'package'),
    ('Purchase Orders', 'purchase-orders', 'Creating and managing POs', 'shopping-cart'),
    ('Vendors', 'vendors', 'Working with vendors', 'users'),
    ('Reports', 'reports', 'Generating reports', 'chart-bar')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'User accounts and profiles';
COMMENT ON TABLE public.locations IS 'Restaurant locations';
COMMENT ON TABLE public.inventory_items IS 'Inventory items per location';
COMMENT ON TABLE public.vendors IS 'Vendor/supplier information';
COMMENT ON TABLE public.purchase_orders IS 'Purchase orders';
COMMENT ON TABLE public.esg_reports IS 'ESG (Environmental, Social, Governance) reports';
COMMENT ON TABLE public.kb_articles IS 'Knowledge base articles';
COMMENT ON TABLE public.audit_log IS 'Audit trail for all changes';
