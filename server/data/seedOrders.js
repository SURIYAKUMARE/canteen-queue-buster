// Seed Orders for CampusBite Demo
export const initialSeedOrders = [
  {
    orderId: 'CB-8493',
    studentId: '21BEC088',
    studentName: 'Priya Nair',
    studentDept: 'ECE Dept • 3rd Year',
    studentPhone: '+91 98123 45678',
    foodItems: [
      { id: 'food-3', name: 'Crispy Masala Dosa', price: 50, quantity: 1, isVeg: true, notes: 'Extra coconut chutney' },
      { id: 'food-9', name: 'Filter Coffee', price: 20, quantity: 1, isVeg: true, notes: 'Strong decoction' }
    ],
    quantities: 2,
    totalAmount: 70,
    paymentMethod: 'Campus RFID Card',
    paymentStatus: 'PAID',
    orderStatus: 'PENDING', // PENDING -> PREPARING -> READY -> COMPLETED
    createdAt: '12:02 PM',
    estimatedPrepMins: 5,
    counterBay: 'Bay 1 (Express)',
    qrCodeData: JSON.stringify({
      orderId: 'CB-8493',
      studentId: '21BEC088',
      studentName: 'Priya Nair',
      totalAmount: 70,
      verificationToken: 'VFY-8493-9B'
    })
  },
  {
    orderId: 'CB-8492',
    studentId: '21BCS042',
    studentName: 'Rahul Sharma',
    studentDept: 'CSE Dept • 3rd Year',
    studentPhone: '+91 98765 43210',
    foodItems: [
      { id: 'food-2', name: 'Special Chicken Biryani Rice', price: 120, quantity: 1, isVeg: false, notes: 'Extra onion raita' },
      { id: 'food-10', name: 'Thick Cold Coffee with Ice Cream', price: 45, quantity: 1, isVeg: true, notes: '' }
    ],
    quantities: 2,
    totalAmount: 165,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'PAID',
    orderStatus: 'PREPARING',
    createdAt: '11:58 AM',
    estimatedPrepMins: 7,
    counterBay: 'Bay 2 (Hot Kitchen)',
    qrCodeData: JSON.stringify({
      orderId: 'CB-8492',
      studentId: '21BCS042',
      studentName: 'Rahul Sharma',
      totalAmount: 165,
      verificationToken: 'VFY-8492-7A'
    })
  },
  {
    orderId: 'CB-8491',
    studentId: '21BCS019',
    studentName: 'Arjun Verma',
    studentDept: 'CSE Dept • 4th Year',
    studentPhone: '+91 97234 56789',
    foodItems: [
      { id: 'food-5', name: 'Crispy Punjabi Samosa (2 pcs)', price: 25, quantity: 1, isVeg: true, notes: 'Extra spicy chutney' },
      { id: 'food-8', name: 'Kulhad Masala Chai', price: 15, quantity: 1, isVeg: true, notes: 'Less sugar' }
    ],
    quantities: 2,
    totalAmount: 40,
    paymentMethod: 'Campus RFID Card',
    paymentStatus: 'PAID',
    orderStatus: 'READY',
    createdAt: '11:50 AM',
    estimatedPrepMins: 3,
    readyAt: '11:54 AM',
    counterBay: 'Bay 1 (Express)',
    qrCodeData: JSON.stringify({
      orderId: 'CB-8491',
      studentId: '21BCS019',
      studentName: 'Arjun Verma',
      totalAmount: 40,
      verificationToken: 'VFY-8491-3C'
    })
  },
  {
    orderId: 'CB-8490',
    studentId: '21BME055',
    studentName: 'Sneha Kulkarni',
    studentDept: 'Mech Dept • 2nd Year',
    studentPhone: '+91 99001 22334',
    foodItems: [
      { id: 'food-1', name: 'South Indian Veg Meals', price: 80, quantity: 1, isVeg: true, notes: '' }
    ],
    quantities: 1,
    totalAmount: 80,
    paymentMethod: 'UPI (PhonePe)',
    paymentStatus: 'PAID',
    orderStatus: 'COMPLETED',
    createdAt: '11:35 AM',
    readyAt: '11:41 AM',
    collectedAt: '11:44 AM',
    counterBay: 'Bay 1 (Express)',
    qrCodeData: JSON.stringify({
      orderId: 'CB-8490',
      studentId: '21BME055',
      studentName: 'Sneha Kulkarni',
      totalAmount: 80,
      verificationToken: 'VFY-8490-1D'
    })
  }
];
