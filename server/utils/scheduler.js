// Pickup Slot Scheduling Logic with Capacity Constraints

export function getFormattedTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12
  const minsStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minsStr} ${ampm}`;
}

export function parseSlotTimeToMinutes(slotStr) {
  // slotStr e.g. "12:10 PM" or "12:10"
  const parts = slotStr.trim().split(/[: ]/);
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const ampm = parts[2] ? parts[2].toUpperCase() : '';
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export function formatMinutesToSlotTime(totalMinutes) {
  let h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  let displayH = h % 12;
  if (displayH === 0) displayH = 12;
  const displayM = m < 10 ? '0' + m : m;
  return `${displayH}:${displayM} ${ampm}`;
}

// Generate an array of 5-minute slots starting from baseMinutes for the next numSlots
export function generateSlots(baseMinutes = 12 * 60, numSlots = 12) {
  const slots = [];
  for (let i = 0; i < numSlots; i++) {
    const mins = baseMinutes + i * 5;
    slots.push(formatMinutesToSlotTime(mins));
  }
  return slots;
}

/**
 * Assign the earliest available pickup slot that respects kitchen capacity
 * @param {Array} existingOrders - List of current active orders
 * @param {number} orderItemCount - Number of items in the new order
 * @param {number} maxCapacityPerSlot - Max items allowed per 5-min slot
 * @param {number} baseMinutes - Current time in minutes (default: 12:00 PM = 720 mins)
 * @param {number} minPrepMinutes - Minimum prep delay required (default: 5 mins)
 */
export function assignPickupSlot({
  existingOrders = [],
  orderItemCount = 1,
  maxCapacityPerSlot = 6,
  baseMinutes = 12 * 60,
  minPrepMinutes = 5
}) {
  // Earliest allowable slot starts at baseMinutes + minPrepMinutes rounded up to next 5-min boundary
  const candidateEarliest = Math.ceil((baseMinutes + minPrepMinutes) / 5) * 5;

  // Calculate current item load per slot
  const slotLoads = {};
  existingOrders.forEach(order => {
    if (order.status !== 'cancelled' && order.status !== 'completed' && order.pickupSlot) {
      slotLoads[order.pickupSlot] = (slotLoads[order.pickupSlot] || 0) + (order.totalItems || 1);
    }
  });

  let inspectedMinutes = candidateEarliest;
  let assignedSlot = null;
  let rolledOverFrom = null;

  // Look ahead up to 2 hours (24 slots)
  for (let step = 0; step < 24; step++) {
    const slotTimeStr = formatMinutesToSlotTime(inspectedMinutes);
    const currentLoad = slotLoads[slotTimeStr] || 0;

    if (currentLoad + orderItemCount <= maxCapacityPerSlot) {
      assignedSlot = slotTimeStr;
      if (inspectedMinutes > candidateEarliest) {
        rolledOverFrom = formatMinutesToSlotTime(candidateEarliest);
      }
      break;
    }
    // Slot is full or cannot accommodate full order items, check next 5-min slot
    inspectedMinutes += 5;
  }

  // Fallback if kitchen is extremely backed up
  if (!assignedSlot) {
    assignedSlot = formatMinutesToSlotTime(inspectedMinutes);
  }

  const assignedSlotLoad = (slotLoads[assignedSlot] || 0) + orderItemCount;

  return {
    assignedSlot,
    slotLoadAfter: assignedSlotLoad,
    maxCapacityPerSlot,
    rolledOver: !!rolledOverFrom,
    rolledOverFrom,
    explanation: rolledOverFrom
      ? `Slot ${rolledOverFrom} was busy/full (capacity: ${maxCapacityPerSlot} items). Auto-assigned earliest open slot ${assignedSlot}.`
      : `Assigned earliest slot ${assignedSlot} (${assignedSlotLoad}/${maxCapacityPerSlot} capacity utilized).`
  };
}
