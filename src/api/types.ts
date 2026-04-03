// api/types.ts

export type KotStatus = "Open" | "Billed" | "Cancelled";
export type KotItemStatus = "Normal" | "Cancelled";
export type KotServiceType = "TABLE" | "ROOM";

export interface Kot {
  kot_id?: number;
  company_id: number;
  kot_no?: string;
  kot_datetime?: string;
  service_type?: KotServiceType;
  guest_id?: number | null;
  booking_id?: number | null;
  folio_id?: number | null;
  room_id?: number | null;
  table_no?: string | null;
  status?: KotStatus;
  notes?: string | null;
  created_by?: number | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  // joined / extra fields
  company_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  room_no?: string | null;
  reservation_no?: string | null;
  folio_no?: string | null;
  display_label?: string;
}

export interface KotItem {
  kot_item_id?: number;
  kot_id: number;
  product_id: number;
  qty: number;
  rate_at_time: number;
  amount?: number;
  status?: KotItemStatus;
  remarks?: string | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  // joined product fields
  product_name?: string;
  product_code?: string | null;
  unit?: string | null;
}

export interface KotDetailResponse {
  kot: Kot;
  items: KotItem[];
}

/**
 * Frontend item used in create/update payloads
 * Note: backend expects "remarks" field, we keep "notes" in UI and map it.
 */
export interface CreateKotItemInput {
  product_id: number;
  qty: number;
  rate_at_time?: number;
  remarks?: string | null; // we will map from notes in UI
  status?: KotItemStatus;
}

/**
 * Create payload according to backend:
 * - It derives service_type from your explicit field
 * - It derives guest_id/folio_id/etc. based on booking_id/room_id
 * - company_id is optional for non SUPER_ADMIN, backend fills it from token
 */
export interface CreateKotPayload {
  company_id?: number;
  kot_datetime?: string;
  service_type: KotServiceType;
  table_no?: string | null;
  room_id?: number | null;
  booking_id?: number | null;
  status?: KotStatus;
  notes?: string | null;
  items: CreateKotItemInput[];
}

/**
 * Update payload (for /kots/:id PUT)
 */
export interface UpdateKotPayload {
  kot_datetime?: string;
  service_type?: KotServiceType;
  table_no?: string | null;
  room_id?: number | null;
  booking_id?: number | null;
  status?: KotStatus;
  notes?: string | null;
  items?: CreateKotItemInput[];
}