-- Migration: Add missing fields for booking system
-- Fixes issues with booking pages and API

-- Add missing transaction_id field to payments table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN transaction_id TEXT;
    END IF;
END $$;

-- Add time_slot_id field to bookings table (if not exists) - needed for booking API
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'time_slot_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN time_slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add phone field to user_profiles (if not exists) - needed for booking contact
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN phone VARCHAR(50);
    END IF;
END $$;

-- Update player_count constraint to allow up to 6 players (as shown in UI)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_player_count_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_player_count_check CHECK (player_count > 0 AND player_count <= 6);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot_id ON bookings(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Fix time_slots table to ensure proper relationship with bookings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_slots' AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE time_slots ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for time_slots booking_id
CREATE INDEX IF NOT EXISTS idx_time_slots_booking_id ON time_slots(booking_id);

-- Add function to update time_slots when booking is created/updated
CREATE OR REPLACE FUNCTION update_time_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Mark time slot as booked when booking is created
        UPDATE time_slots 
        SET is_available = false, booking_id = NEW.id 
        WHERE id = NEW.time_slot_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle booking status changes
        IF OLD.status != NEW.status THEN
            IF NEW.status IN ('cancelled', 'completed') THEN
                -- Mark time slot as available when booking is cancelled/completed
                UPDATE time_slots 
                SET is_available = true, booking_id = NULL 
                WHERE booking_id = NEW.id;
            ELSIF OLD.status IN ('cancelled', 'completed') AND NEW.status NOT IN ('cancelled', 'completed') THEN
                -- Mark time slot as unavailable when booking is reactivated
                UPDATE time_slots 
                SET is_available = false, booking_id = NEW.id 
                WHERE id = NEW.time_slot_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Mark time slot as available when booking is deleted
        UPDATE time_slots 
        SET is_available = true, booking_id = NULL 
        WHERE booking_id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic time slot management
DROP TRIGGER IF EXISTS trigger_time_slot_availability ON bookings;
CREATE TRIGGER trigger_time_slot_availability
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_time_slot_availability();

-- Update existing time_slots to be available if they don't have bookings
UPDATE time_slots 
SET is_available = true 
WHERE booking_id IS NULL;

-- Update existing time_slots to be unavailable if they have bookings
UPDATE time_slots 
SET is_available = false 
WHERE booking_id IS NOT NULL;

-- Insert default platform settings if they don't exist
INSERT INTO platform_settings (commission_rate, refund_threshold_hours, currency) 
VALUES (10.00, 24, 'USD')
ON CONFLICT (id) DO NOTHING;

COMMENT ON COLUMN bookings.time_slot_id IS 'Reference to the time slot booked';
COMMENT ON COLUMN payments.transaction_id IS 'Transaction ID from payment gateway';
COMMENT ON COLUMN time_slots.booking_id IS 'Reference to the booking that occupies this time slot';