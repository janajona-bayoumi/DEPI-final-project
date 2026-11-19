// ============================================================
// mockApi.js — services implementation on top of localStorage.
//
// Same function names/signatures that the real backend will have.
// When the backend is ready: create httpApi.js with the same exports
// and change one line in index.js. No component changes.
//
// Rules:
//  - all functions are async (return Promises)
//  - business errors are returned as { ok: false, error }, never thrown
//  - dates 'YYYY-MM-DD', times 'HH:mm' (24h, local time)
// ============================================================
import { DOCTORS } from "./mockData";
import { APPOINTMENT_STATUS, BOOKING_ERRORS } from "./models";
import {
  loadAppointments,
  saveAppointments,
  loadQueues,
  saveQueues,
  loadRatings,
  saveRatings,
  queueKey,
  clearAll,
} from "./storage";

// Simulates network latency so loading states are visible.
const delay = (value, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Returns a local Date at midnight, or null if the string is not a real date.
function parseDate(date) {
  if (typeof date !== "string" || !DATE_RE.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const valid =
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  return valid ? dt : null;
}

// Slot must be on a working day, inside working hours, aligned to slotDuration.
function isWithinSchedule(doctor, dateObj, time) {
  const { daysOfWeek, startTime, endTime } = doctor.businessHours;
  if (!daysOfWeek.includes(dateObj.getDay())) return false;
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const t = toMinutes(time);
  return (
    t >= start &&
    t + doctor.slotDuration <= end &&
    (t - start) % doctor.slotDuration === 0
  );
}

function withRating(doctor, ratings) {
  const override = ratings[doctor.id];
  const rating = override ? override.rating : doctor.rating;
  const ratingCount = override ? override.ratingCount : doctor.ratingCount;
  return { ...doctor, rating: Math.round(rating * 10) / 10, ratingCount };
}

const emptyQueue = (doctorId, date) => ({
  doctorId,
  date,
  currentNumber: 0,
  lastTicket: 0,
});

// Counts 'booked' tickets still waiting. Cancelled tickets never inflate the number.
// With ticketNumber: only tickets ahead of it (currentNumber < ticket < ticketNumber).
// Without: every booked ticket after currentNumber.
function countWaiting(appointments, queue, ticketNumber) {
  return appointments.filter(
    (a) =>
      a.doctorId === queue.doctorId &&
      a.date === queue.date &&
      a.status === APPOINTMENT_STATUS.BOOKED &&
      a.ticketNumber > queue.currentNumber &&
      (ticketNumber === undefined || a.ticketNumber < ticketNumber),
  ).length;
}

const newId = () =>
  `a_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const fail = (error) => delay({ ok: false, error });

// ------------------------------------------------------------
// Doctors
// ------------------------------------------------------------

/**
 * Doctors list, optionally filtered by specialty.
 * Ratings reflect user ratings saved via rateAppointment.
 * @param {string} [specialty]
 * @returns {Promise<import('./models').Doctor[]>}
 */
export function getDoctors(specialty) {
  const ratings = loadRatings();
  const list = DOCTORS.filter(
    (d) => !specialty || d.specialty === specialty,
  ).map((d) => withRating(d, ratings));
  return delay(list);
}

// ------------------------------------------------------------
// Booking
// ------------------------------------------------------------

/**
 * Book a slot. Checks (in order): INVALID, PAST, CONFLICT. Issues the ticket number.
 * @param {{doctorId:string, date:string, time:string}} params
 * @returns {Promise<{ok:true, appointment:import('./models').Appointment}
 *                 | {ok:false, error:'CONFLICT'|'PAST'|'INVALID'}>}
 */
export function bookSlot({ doctorId, date, time } = {}) {
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  const dateObj = parseDate(date);
  if (!doctor || !dateObj || typeof time !== "string" || !TIME_RE.test(time)) {
    return fail(BOOKING_ERRORS.INVALID);
  }
  if (!isWithinSchedule(doctor, dateObj, time))
    return fail(BOOKING_ERRORS.INVALID);

  const [h, m] = time.split(":").map(Number);
  const slotStart = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    h,
    m,
  );
  if (slotStart <= new Date()) return fail(BOOKING_ERRORS.PAST);

  const appointments = loadAppointments();
  const taken = appointments.some(
    (a) =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.time === time &&
      a.status !== APPOINTMENT_STATUS.CANCELLED,
  );
  if (taken) return fail(BOOKING_ERRORS.CONFLICT);

  // Ticket numbers are per (doctor + date) and are never reused, even after cancel.
  const queues = loadQueues();
  const key = queueKey(doctorId, date);
  const queue = queues[key] ?? emptyQueue(doctorId, date);
  queue.lastTicket += 1;
  queues[key] = queue;

  const appointment = {
    id: newId(),
    doctorId,
    date,
    time,
    ticketNumber: queue.lastTicket,
    status: APPOINTMENT_STATUS.BOOKED,
    rating: null,
  };
  appointments.push(appointment);

  saveQueues(queues);
  saveAppointments(appointments);
  return delay({ ok: true, appointment });
}

/**
 * Booked time slots for a doctor on a date (Calendar). Cancelled slots are free again.
 * @param {string} doctorId
 * @param {string} date
 * @returns {Promise<string[]>} e.g. ['09:20', '09:40']
 */
export function getBookedSlots(doctorId, date) {
  const times = loadAppointments()
    .filter(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        a.status !== APPOINTMENT_STATUS.CANCELLED,
    )
    .map((a) => a.time)
    .sort();
  return delay(times);
}

// ------------------------------------------------------------
// Queue
// ------------------------------------------------------------

/**
 * Queue state for one doctor on one date.
 * `waiting` counts only 'booked' tickets: pass the patient's ticketNumber to get
 * the number of patients ahead of them; omit it to get everyone still waiting.
 * Estimated wait = waiting × doctor.slotDuration.
 * @param {string} doctorId
 * @param {string} date 'YYYY-MM-DD'
 * @param {number} [ticketNumber] the patient's ticket
 * @returns {Promise<import('./models').Queue>}
 */
export function getQueue(doctorId, date, ticketNumber) {
  const queue =
    loadQueues()[queueKey(doctorId, date)] ?? emptyQueue(doctorId, date);
  const ticket = Number.isInteger(ticketNumber) ? ticketNumber : undefined;
  const waiting = countWaiting(loadAppointments(), queue, ticket);
  return delay({ ...queue, waiting });
}

/**
 * Call the next patient: finishes the current one (in-progress -> done),
 * moves to the next booked ticket (booked -> in-progress), skipping cancelled ones.
 * If nobody is waiting, currentNumber stays the same.
 * @param {string} doctorId
 * @param {string} date
 * @returns {Promise<import('./models').Queue>}
 */
export function callNext(doctorId, date) {
  const queues = loadQueues();
  const key = queueKey(doctorId, date);
  const queue = queues[key] ?? emptyQueue(doctorId, date);

  const appointments = loadAppointments();
  const todays = appointments.filter(
    (a) => a.doctorId === doctorId && a.date === date,
  );

  const current = todays.find(
    (a) =>
      a.ticketNumber === queue.currentNumber &&
      a.status === APPOINTMENT_STATUS.IN_PROGRESS,
  );
  if (current) current.status = APPOINTMENT_STATUS.DONE;

  const next = todays
    .filter(
      (a) =>
        a.status === APPOINTMENT_STATUS.BOOKED &&
        a.ticketNumber > queue.currentNumber,
    )
    .sort((a, b) => a.ticketNumber - b.ticketNumber)[0];
  if (next) {
    next.status = APPOINTMENT_STATUS.IN_PROGRESS;
    queue.currentNumber = next.ticketNumber;
  }

  queues[key] = queue;
  saveQueues(queues);
  saveAppointments(appointments);
  return delay({ ...queue, waiting: countWaiting(appointments, queue) });
}

// ------------------------------------------------------------
// Appointments history
// ------------------------------------------------------------

/**
 * All appointments (History page), sorted by date then time (oldest first).
 * @returns {Promise<import('./models').Appointment[]>}
 */
export function getAppointments() {
  const list = loadAppointments().sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
  return delay(list);
}

/**
 * Cancel an upcoming appointment (status -> cancelled, slot is free again).
 * Only 'booked' appointments can be cancelled.
 * @param {string} appointmentId
 * @returns {Promise<{ok:true} | {ok:false, error:'NOT_FOUND'|'INVALID'}>}
 */
export function cancelAppointment(appointmentId) {
  const appointments = loadAppointments();
  const appointment = appointments.find((a) => a.id === appointmentId);
  if (!appointment) return fail(BOOKING_ERRORS.NOT_FOUND);
  if (appointment.status !== APPOINTMENT_STATUS.BOOKED)
    return fail(BOOKING_ERRORS.INVALID);

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  saveAppointments(appointments);
  return delay({ ok: true });
}

/**
 * Rate an appointment 1-5 and update the doctor's average rating.
 * Re-rating the same appointment replaces the old rating (count does not grow).
 * @param {string} appointmentId
 * @param {number} rating integer 1-5
 * @returns {Promise<{ok:true, rating:number} | {ok:false, error:'NOT_FOUND'|'INVALID'}>}
 */
export function rateAppointment(appointmentId, rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail(BOOKING_ERRORS.INVALID);
  }
  const appointments = loadAppointments();
  const appointment = appointments.find((a) => a.id === appointmentId);
  if (!appointment) return fail(BOOKING_ERRORS.NOT_FOUND);
  if (appointment.status === APPOINTMENT_STATUS.CANCELLED)
    return fail(BOOKING_ERRORS.INVALID);

  const doctor = DOCTORS.find((d) => d.id === appointment.doctorId);
  const ratings = loadRatings();
  const current = ratings[doctor.id] ?? {
    rating: doctor.rating,
    ratingCount: doctor.ratingCount,
  };

  let total = current.rating * current.ratingCount;
  let count = current.ratingCount;
  if (appointment.rating != null) {
    total -= appointment.rating; // replacing an old rating
  } else {
    count += 1;
  }
  total += rating;
  ratings[doctor.id] = { rating: total / count, ratingCount: count };

  appointment.rating = rating;
  saveRatings(ratings);
  saveAppointments(appointments);
  return delay({ ok: true, rating });
}

// ------------------------------------------------------------
// Demo helpers (mock only — removed when the backend arrives)
// ------------------------------------------------------------

/**
 * Clears all MediQueue data (appointments, queues, ratings) so the demo can restart.
 * @returns {Promise<{ok:true}>}
 */
export function resetDemoData() {
  clearAll();
  return delay({ ok: true });
}
