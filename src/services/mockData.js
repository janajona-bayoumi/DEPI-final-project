// ============================================================
// mockData.js — fake doctors used until the backend exists.
// 7 doctors, different specialties, slot durations and working days.
// photo: null → DoctorCard shows a default avatar.
// ============================================================

/** @type {import('./models').Doctor[]} */
export const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Ahmed Samir",
    specialty: "Cardiology",
    photo: null,
    rating: 4.6,
    ratingCount: 28,
    slotDuration: 20,
    businessHours: {
      daysOfWeek: [0, 1, 2, 3, 4],
      startTime: "09:00",
      endTime: "15:00",
    },
  },
  {
    id: "d2",
    name: "Dr. Mona Hassan",
    specialty: "Pediatrics",
    photo: null,
    rating: 4.8,
    ratingCount: 41,
    slotDuration: 15,
    businessHours: {
      daysOfWeek: [0, 1, 2, 3, 4],
      startTime: "10:00",
      endTime: "16:00",
    },
  },
  {
    id: "d3",
    name: "Dr. Khaled Adel",
    specialty: "Orthopedics",
    photo: null,
    rating: 4.3,
    ratingCount: 19,
    slotDuration: 30,
    businessHours: {
      daysOfWeek: [0, 2, 4],
      startTime: "12:00",
      endTime: "18:00",
    },
  },
  {
    id: "d4",
    name: "Dr. Sara Mahmoud",
    specialty: "Dermatology",
    photo: null,
    rating: 4.5,
    ratingCount: 33,
    slotDuration: 20,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4],
      startTime: "11:00",
      endTime: "17:00",
    },
  },
  {
    id: "d5",
    name: "Dr. Yasser Fathy",
    specialty: "Ophthalmology",
    photo: null,
    rating: 4.2,
    ratingCount: 15,
    slotDuration: 15,
    businessHours: {
      daysOfWeek: [0, 1, 2, 3],
      startTime: "09:00",
      endTime: "14:00",
    },
  },
  {
    id: "d6",
    name: "Dr. Hala Ibrahim",
    specialty: "Internal Medicine",
    photo: null,
    rating: 4.7,
    ratingCount: 52,
    slotDuration: 20,
    businessHours: {
      daysOfWeek: [0, 1, 2, 3, 4],
      startTime: "13:00",
      endTime: "19:00",
    },
  },
  {
    id: "d7",
    name: "Dr. Omar Nabil",
    specialty: "ENT",
    photo: null,
    rating: 4.1,
    ratingCount: 12,
    slotDuration: 20,
    businessHours: {
      daysOfWeek: [1, 3, 4],
      startTime: "10:00",
      endTime: "15:00",
    },
  },
];
