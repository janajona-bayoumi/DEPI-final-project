// ============================================================
// models.js — data models + shared constants
// Any change here must be announced in the team group immediately.
// ============================================================

/**
 * @typedef {Object} BusinessHours
 * @property {number[]} daysOfWeek  0 = Sunday ... 6 = Saturday (same as FullCalendar)
 * @property {string}   startTime   'HH:mm' (24h)
 * @property {string}   endTime     'HH:mm' (24h)
 */

/**
 * @typedef {Object} Doctor
 * @property {string}        id
 * @property {string}        name
 * @property {string}        specialty
 * @property {string|null}   photo         null = component shows a default avatar
 * @property {number}        rating        average rating (0-5)
 * @property {number}        ratingCount   number of ratings
 * @property {number}        slotDuration  consultation length in minutes
 * @property {BusinessHours} businessHours
 */

/**
 * @typedef {Object} Appointment
 * @property {string}      id
 * @property {string}      doctorId
 * @property {string}      date          'YYYY-MM-DD'
 * @property {string}      time          'HH:mm'
 * @property {number}      ticketNumber  queue number per (doctor + date)
 * @property {'booked'|'in-progress'|'done'|'cancelled'} status
 * @property {number|null} rating        1-5 or null
 */

/**
 * @typedef {Object} Queue
 * @property {string} doctorId
 * @property {string} date
 * @property {number} currentNumber  ticket currently being served (0 = not started)
 * @property {number} lastTicket     last issued ticket number
 */

export const APPOINTMENT_STATUS = {
  BOOKED: "booked",
  IN_PROGRESS: "in-progress",
  DONE: "done",
  CANCELLED: "cancelled",
};

export const BOOKING_ERRORS = {
  CONFLICT: "CONFLICT", // slot already booked
  PAST: "PAST", // time is in the past
  INVALID: "INVALID", // missing data or unknown doctor
};

export const SPECIALTIES = [
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Ophthalmology",
  "Internal Medicine",
  "ENT",
];
