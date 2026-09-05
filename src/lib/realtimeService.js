import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { realtimeEmitter } from './databaseService.js';
import { normalizeOrder } from '../utils/orderUtils.js';

/**
 * Subscribe to live order events (New Paid Orders, Status Updates)
 * @param {Function} onNewOrder - Callback when a new order is paid and placed
 * @param {Function} onOrderUpdate - Callback when an existing order changes status
 * @returns {Function} unsubscribe function
 */
export function subscribeToOrders({ onNewOrder, onOrderUpdate }) {
  if (isSupabaseConfigured && supabase) {
    const processPayload = async (rawRow, isNew) => {
      if (!rawRow) return;
      let enriched = normalizeOrder(rawRow);

      // Attempt to fetch relations from Supabase if not present in raw row
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*), students(*)')
          .eq('id', rawRow.id)
          .maybeSingle();

        if (!error && data) {
          enriched = normalizeOrder({
            ...data,
            items: (data.order_items && data.order_items.length > 0) ? data.order_items : enriched.items
          });
        }
      } catch (e) {
        // Fallback to normalized initial
      }

      if (isNew && onNewOrder) {
        onNewOrder(enriched);
      }
      if (!isNew && onOrderUpdate) {
        onOrderUpdate(enriched);
      }
    };

    const channel = supabase
      .channel('campusbite-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        payload => {
          if (payload.new && payload.new.payment_status === 'PAID') {
            processPayload(payload.new, true);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        payload => {
          if (payload.new) {
            // Check if transition from PENDING to PAID
            const isTransitionToPaid = payload.old?.payment_status !== 'PAID' && payload.new.payment_status === 'PAID';
            processPayload(payload.new, isTransitionToPaid);
          }
        }
      )
      .subscribe((status) => {
        console.log('[CampusBite Realtime] Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    // Local Realtime pub-sub
    const unsubs = [];
    if (onNewOrder) {
      unsubs.push(realtimeEmitter.on('NEW_PAID_ORDER', onNewOrder));
    }
    if (onOrderUpdate) {
      unsubs.push(realtimeEmitter.on('ORDER_UPDATED', onOrderUpdate));
    }

    return () => {
      unsubs.forEach(fn => fn());
    };
  }
}

/**
 * Subscribe to food items changes (Menu updates / stock toggles)
 */
export function subscribeToFoodItems(onItemsChanged) {
  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('campusbite-menu-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_items' },
        payload => {
          if (onItemsChanged) onItemsChanged(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    return realtimeEmitter.on('FOOD_ITEMS_CHANGED', onItemsChanged);
  }
}
