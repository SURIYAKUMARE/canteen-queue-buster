/**
 * Offline Synchronization Engine for CampusBite.
 * Manages an optimistic offline mutation queue that automatically reconciles
 * with Supabase when network connectivity returns.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const QUEUE_STORAGE_KEY = 'CAMPUSBITE_OFFLINE_QUEUE_V2';

class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flushQueue());
      // Periodic sync check every 25 seconds
      setInterval(() => {
        if (navigator.onLine && this.getQueueLength() > 0) {
          this.flushQueue();
        }
      }, 25000);
    }
  }

  getQueue() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return this.memoryQueue || [];
    }
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : (this.memoryQueue || []);
    } catch (e) {
      return this.memoryQueue || [];
    }
  }

  setQueue(queue) {
    this.memoryQueue = queue;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.notifyListeners();
      return;
    }
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
      this.notifyListeners();
    } catch (e) {
      console.warn('[SyncEngine] Failed to persist queue:', e);
    }
  }

  getQueueLength() {
    return this.getQueue().length;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const len = this.getQueueLength();
    this.listeners.forEach(cb => {
      try { cb({ queueLength: len, isSyncing: this.isSyncing }); } catch (e) {}
    });
  }

  /**
   * Enqueues an action to be dispatched to Supabase
   */
  enqueue(actionType, payload) {
    const queue = this.getQueue();
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sync-${Date.now()}-${Math.random()}`,
      action: actionType,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0
    };
    queue.push(item);
    this.setQueue(queue);

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.flushQueue();
    }
    return item;
  }

  /**
   * Flushes and processes all pending queued actions
   */
  async flushQueue() {
    if (this.isSyncing) return;
    if (!isSupabaseConfigured || !supabase) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    this.notifyListeners();

    const remainingQueue = [];

    for (const item of queue) {
      try {
        let success = false;

        switch (item.action) {
          case 'UPDATE_ORDER_STATUS': {
            const { orderId, newStatus, updatedAt } = item.payload;
            const query = supabase
              .from('orders')
              .update({ order_status: newStatus, updated_at: updatedAt });
            
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
            const res = isUUID 
              ? await query.eq('id', orderId)
              : await query.or(`order_number.eq.${orderId},token_number.eq.${orderId}`);

            success = !res.error;
            break;
          }

          case 'CONFIRM_HANDOVER': {
            const { orderId, scannedAt, updatedAt } = item.payload;
            const query = supabase
              .from('orders')
              .update({ order_status: 'COMPLETED', qr_scanned_at: scannedAt, updated_at: updatedAt });
            
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
            const res = isUUID 
              ? await query.eq('id', orderId)
              : await query.or(`order_number.eq.${orderId},token_number.eq.${orderId}`);

            success = !res.error;
            break;
          }

          default:
            success = true; // Unknown actions removed to prevent queue deadlock
        }

        if (!success) {
          item.attempts += 1;
          if (item.attempts < 5) {
            remainingQueue.push(item);
          }
        }
      } catch (err) {
        item.attempts += 1;
        if (item.attempts < 5) {
          remainingQueue.push(item);
        }
      }
    }

    this.setQueue(remainingQueue);
    this.isSyncing = false;
    this.notifyListeners();
  }
}

export const syncEngine = new SyncEngine();
