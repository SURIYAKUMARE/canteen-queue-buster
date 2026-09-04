// Walk-in Order Natural Language Parser (Rule-based NLP concept demo)
import { initialMenuItems } from '../data/menu.js';

const NUMBER_WORDS = {
  'a': 1,
  'an': 1,
  'one': 1,
  'single': 1,
  'two': 2,
  'couple': 2,
  'pair': 2,
  'double': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10
};

// Item alias mapping
const ITEM_ALIASES = [
  { id: 'item-1', name: 'Veg Thali Deluxe', aliases: ['veg thali deluxe', 'veg thali', 'deluxe thali', 'thali', 'veg meal', 'lunch thali'] },
  { id: 'item-2', name: 'Special Paneer Butter Masala Combo', aliases: ['paneer butter masala', 'paneer combo', 'paneer masala', 'paneer curry', 'paneer'] },
  { id: 'item-3', name: 'Crispy Masala Dosa', aliases: ['crispy masala dosa', 'masala dosa', 'dosa', 'crispy dosa'] },
  { id: 'item-4', name: 'Chole Bhature (2 Pcs)', aliases: ['chole bhature', 'bhature', 'chole bhatura', 'choley bhature', 'chole'] },
  { id: 'item-5', name: 'Veg Cheese Grilled Sandwich', aliases: ['veg cheese grilled sandwich', 'grilled sandwich', 'cheese sandwich', 'veg sandwich', 'sandwich'] },
  { id: 'item-6', name: 'Crispy Samosa (2 Pcs)', aliases: ['crispy samosa', 'punjabi samosa', 'samosa', 'samosas', 'samose'] },
  { id: 'item-7', name: 'Butter Pav Bhaji', aliases: ['butter pav bhaji', 'pav bhaji', 'bhaji pav', 'pavbhaji', 'bhaji'] },
  { id: 'item-8', name: 'Egg Curry with 2 Parottas', aliases: ['egg curry with 2 parottas', 'egg curry', 'egg parotta', 'parotta', 'anda curry'] },
  { id: 'item-9', name: 'Kulhad Masala Chai', aliases: ['kulhad masala chai', 'masala chai', 'kulhad chai', 'chai', 'tea', 'hot tea'] },
  { id: 'item-10', name: 'Cold Coffee with Ice Cream', aliases: ['cold coffee with ice cream', 'cold coffee', 'iced coffee', 'frappe', 'coffee'] }
];

const MODIFIER_PATTERNS = [
  { regex: /\b(no\s+onion(\s*,\s*no\s+garlic)?|without\s+onion|jain(\s+style)?)\b/i, tag: 'No Onion/Garlic' },
  { regex: /\b(extra\s+(spicy|chili|mirchi)|very\s+spicy|more\s+spice)\b/i, tag: 'Extra Spicy' },
  { regex: /\b(less\s+(spicy|chili|spice)|mild|not\s+spicy)\b/i, tag: 'Mild / Less Spicy' },
  { regex: /\b(extra\s+chutney|more\s+chutney|chutney\s+extra)\b/i, tag: 'Extra Chutney' },
  { regex: /\b(without\s+sambar|no\s+sambar)\b/i, tag: 'Without Sambar' },
  { regex: /\b(extra\s+sambar|more\s+sambar)\b/i, tag: 'Extra Sambar' },
  { regex: /\b(less\s+sugar|low\s+sugar|without\s+sugar|sugar\s+free|no\s+sugar)\b/i, tag: 'Less / No Sugar' },
  { regex: /\b(extra\s+butter|more\s+butter|crispy|well\s+done)\b/i, tag: 'Extra Crispy / Butter' },
  { regex: /\b(pack\s+separately|takeaway|parcel)\b/i, tag: 'Parcel Packing' },
  { regex: /\b(extra\s+cheese|more\s+cheese)\b/i, tag: 'Extra Cheese' }
];

export function parseNaturalLanguageOrder(text, menu = initialMenuItems) {
  if (!text || typeof text !== 'string') {
    return {
      rawInput: '',
      items: [],
      totalAmount: 0,
      confidence: 0,
      explanation: 'Please enter order text (e.g. "veg thali no onion and a chai")'
    };
  }

  const cleanText = text.trim().toLowerCase();
  
  // Segment phrases joined by 'and', 'with', 'plus', '+', '&', commas
  const segments = cleanText.split(/[\n,;]|(?:\s+(?:and|plus|\&|\+)\s+)/i).filter(Boolean);

  const matchedItems = [];
  const recognizedEntities = [];

  // Track global detected modifiers if attached to whole sentence
  const globalModifiers = [];
  for (const mod of MODIFIER_PATTERNS) {
    if (mod.regex.test(cleanText)) {
      if (!globalModifiers.includes(mod.tag)) {
        globalModifiers.push(mod.tag);
      }
    }
  }

  for (const segment of segments) {
    let matchedInSegment = false;

    // Check each alias from longest to shortest
    for (const itemEntry of ITEM_ALIASES) {
      const sortedAliases = [...itemEntry.aliases].sort((a, b) => b.length - a.length);

      for (const alias of sortedAliases) {
        const aliasRegex = new RegExp(`\\b${alias}\\b`, 'i');
        const match = segment.match(aliasRegex);

        if (match) {
          // Look for quantity preceding or following the alias
          const preText = segment.substring(0, match.index).trim();
          let quantity = 1;

          // Check digits e.g. "2" or "3x"
          const digitMatch = preText.match(/(\d+)\s*x?$/i);
          if (digitMatch) {
            quantity = parseInt(digitMatch[1], 10);
          } else {
            // Check word number e.g. "two", "a", "one"
            const words = preText.split(/\s+/);
            const lastWord = words[words.length - 1];
            if (NUMBER_WORDS[lastWord]) {
              quantity = NUMBER_WORDS[lastWord];
            }
          }

          // Extract segment-specific modifiers
          const itemModifiers = [];
          for (const mod of MODIFIER_PATTERNS) {
            if (mod.regex.test(segment)) {
              itemModifiers.push(mod.tag);
            }
          }

          // If no segment specific modifiers found, inherit relevant global ones
          if (itemModifiers.length === 0 && globalModifiers.length > 0) {
            // e.g. "less sugar" goes to beverage, "no onion" goes to meals
            if (itemEntry.id === 'item-9' || itemEntry.id === 'item-10') {
              if (globalModifiers.includes('Less / No Sugar')) itemModifiers.push('Less / No Sugar');
            }
            if (itemEntry.id === 'item-1' || itemEntry.id === 'item-2' || itemEntry.id === 'item-7') {
              if (globalModifiers.includes('No Onion/Garlic')) itemModifiers.push('No Onion/Garlic');
              if (globalModifiers.includes('Extra Spicy')) itemModifiers.push('Extra Spicy');
              if (globalModifiers.includes('Mild / Less Spicy')) itemModifiers.push('Mild / Less Spicy');
            }
          }

          const menuItem = menu.find(m => m.id === itemEntry.id) || {
            id: itemEntry.id,
            name: itemEntry.name,
            price: 50,
            emoji: '🍽️'
          };

          // Check if already in matchedItems, if so increment quantity
          const existing = matchedItems.find(m => m.id === menuItem.id);
          if (existing) {
            existing.quantity += quantity;
            existing.modifiers = Array.from(new Set([...existing.modifiers, ...itemModifiers]));
          } else {
            matchedItems.push({
              id: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              emoji: menuItem.emoji,
              prepTimeMinutes: menuItem.prepTimeMinutes || 5,
              quantity,
              modifiers: itemModifiers,
              lineTotal: menuItem.price * quantity
            });
          }

          recognizedEntities.push({
            alias,
            itemName: menuItem.name,
            quantity,
            modifiers: itemModifiers
          });

          matchedInSegment = true;
          break; // Found best match for this segment
        }
      }
      if (matchedInSegment) break;
    }
  }

  // Calculate total amount and confidence
  const totalAmount = matchedItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalItems = matchedItems.reduce((acc, item) => acc + item.quantity, 0);
  
  let confidence = 0;
  if (matchedItems.length > 0) {
    confidence = Math.min(98, 70 + matchedItems.length * 10 + (globalModifiers.length > 0 ? 8 : 0));
  }

  return {
    rawInput: text,
    items: matchedItems,
    totalItems,
    totalAmount,
    modifiersDetected: globalModifiers,
    recognizedEntities,
    confidence,
    status: matchedItems.length > 0 ? 'SUCCESS' : 'NO_MATCH',
    explanation: matchedItems.length > 0
      ? `Successfully extracted ${matchedItems.length} menu items (${totalItems} portions) with ${globalModifiers.length} modifier tags.`
      : 'Could not match any menu items. Try e.g. "veg thali no onion and a chai" or "2 samosa and cold coffee".'
  };
}
