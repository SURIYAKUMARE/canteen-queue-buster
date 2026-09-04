// Seed Orders for CampusBite Demo
export const initialSeedOrders = [
  {
    orderId: 'ORD1001',
    orderNumber: 'ORD1001',
    tokenNumber: 'TKN245',
    studentId: 'STU001',
    studentName: 'Arun Kumar',
    studentDept: 'CSE Dept • 3rd Year',
    studentPhone: '+91 98765 43210',
    foodItems: [
      { id: 'food-3', name: 'Crispy Masala Dosa', price: 55, quantity: 2, isVeg: true, notes: 'Extra coconut chutney' },
      { id: 'food-8', name: 'Kulhad Masala Chai', price: 15, quantity: 2, isVeg: true, notes: 'Hot' }
    ],
    items: [
      { id: 'food-3', name: 'Crispy Masala Dosa', price: 55, quantity: 2, isVeg: true, notes: 'Extra coconut chutney' },
      { id: 'food-8', name: 'Kulhad Masala Chai', price: 15, quantity: 2, isVeg: true, notes: 'Hot' }
    ],
    quantities: 4,
    totalAmount: 140,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'PAID',
    orderStatus: 'PAID',
    createdAt: '12:05 PM',
    estimatedPrepMins: 5,
    counterBay: 'Bay 1 (Express)',
    qrCodeData: JSON.stringify({
      orderId: 'ORD1001',
      tokenNumber: 'TKN245',
      studentId: 'STU001',
      studentName: 'Arun Kumar',
      totalAmount: 140,
      token: 'SEC-TOK-1001'
    })
  },
  {
    orderId: 'ORD1002',
    orderNumber: 'ORD1002',
    tokenNumber: 'TKN246',
    studentId: '21BEC088',
    studentName: 'Priya Nair',
    studentDept: 'ECE Dept • 3rd Year',
    studentPhone: '+91 98123 45678',
    foodItems: [
      { id: 'food-2', name: 'Veg Thali Deluxe', price: 85, quantity: 1, isVeg: true, notes: '' },
      { id: 'food-7', name: 'Thick Cold Coffee with Ice Cream', price: 45, quantity: 1, isVeg: true, notes: '' }
    ],
    items: [
      { id: 'food-2', name: 'Veg Thali Deluxe', price: 85, quantity: 1, isVeg: true, notes: '' },
      { id: 'food-7', name: 'Thick Cold Coffee with Ice Cream', price: 45, quantity: 1, isVeg: true, notes: '' }
    ],
    quantities: 2,
    totalAmount: 130,
    paymentMethod: 'Campus RFID Card',
    paymentStatus: 'PAID',
    orderStatus: 'PREPARING',
    createdAt: '11:58 AM',
    estimatedPrepMins: 7,
    counterBay: 'Bay 2 (Hot Kitchen)',
    qrCodeData: JSON.stringify({
      orderId: 'ORD1002',
      tokenNumber: 'TKN246',
      studentId: '21BEC088',
      studentName: 'Priya Nair',
      totalAmount: 130,
      token: 'SEC-TOK-1002'
    })
  },
  {
    orderId: 'ORD1003',
    orderNumber: 'ORD1003',
    tokenNumber: 'TKN247',
    studentId: '21BCS019',
    studentName: 'Arjun Verma',
    studentDept: 'CSE Dept • 4th Year',
    studentPhone: '+91 97234 56789',
    foodItems: [
      { id: 'food-4', name: 'Veg Cheese Grilled Sandwich', price: 50, quantity: 1, isVeg: true, notes: 'Toasted crisp' }
    ],
    items: [
      { id: 'food-4', name: 'Veg Cheese Grilled Sandwich', price: 50, quantity: 1, isVeg: true, notes: 'Toasted crisp' }
    ],
    quantities: 1,
    totalAmount: 50,
    paymentMethod: 'Campus RFID Card',
    paymentStatus: 'PAID',
    orderStatus: 'READY',
    createdAt: '11:50 AM',
    estimatedPrepMins: 3,
    readyAt: '11:54 AM',
    counterBay: 'Bay 1 (Express)',
    qrCodeData: JSON.stringify({
      orderId: 'ORD1003',
      tokenNumber: 'TKN247',
      studentId: '21BCS019',
      studentName: 'Arjun Verma',
      totalAmount: 50,
      token: 'SEC-TOK-1003'
    })
  },
  {
    orderId: 'ORD1004',
    orderNumber: 'ORD1004',
    tokenNumber: 'TKN248',
    studentId: '21BME055',
    studentName: 'Sneha Kulkarni',
    studentDept: 'Mech Dept • 2nd Year',
    studentPhone: '+91 99001 22334',
    foodItems: [
      { id: 'food-6', name: 'Butter Pav Bhaji', price: 65, quantity: 1, isVeg: true, notes: '' }
    ],
    items: [
      { id: 'food-6', name: 'Butter Pav Bhaji', price: 65, quantity: 1, isVeg: true, notes: '' }
    ],
    quantities: 1,
    totalAmount: 65,
    paymentMethod: 'UPI (PhonePe)',
    paymentStatus: 'PAID',
    orderStatus: 'COMPLETED',
    createdAt: '11:35 AM',
    readyAt: '11:41 AM',
    collectedAt: '11:44 AM',
    counterBay: 'Bay 1 (Express)',
    qrCodeData: JSON.stringify({
      orderId: 'ORD1004',
      tokenNumber: 'TKN248',
      studentId: '21BME055',
      studentName: 'Sneha Kulkarni',
      totalAmount: 65,
      token: 'SEC-TOK-1004'
    })
  }
];
