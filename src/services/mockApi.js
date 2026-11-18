// ============================================================
// mockApi.js — fake implementation of the services (stubs).
//
// Same function names/signatures as the final API, constant return values.
// Day 19-20: bodies get replaced with a real localStorage implementation.
// Later: replaced entirely by httpApi.js (real backend).
// Signatures NEVER change, so no component is affected.
// ============================================================
import { DOCTORS } from "./mockData";

// Simulates network latency so loading states are visible.
const delay = (value, ms = 250) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/**
 * Doctors list, optionally filtered by specialty.
 * @param {string} [specialty]
 * @returns {Promise<import('./models').Doctor[]>}
 */
export function getDoctors(specialty) {
  const list = specialty
    ? DOCTORS.filter((d) => d.specialty === specialty)
    : DOCTORS;
  return delay(list);
}

/**
 * Book a slot. (Real version: rejects conflicts/past times, issues the ticket.)
 * @param {{doctorId:string, date:string, time:string}} params
 * @returns {Promise<{ok:true, appointment:import('./models').Appointment}
 *                 | {ok:false, error:'CONFLICT'|'PAST'|'INVALID'}>}
 */
export function bookSlot({ doctorId, date, time }) {
  return delay({
    ok: true,
    appointment: {
      id: "a1",
      doctorId,
      date,
      time,
      ticketNumber: 5,
      status: "booked",
      rating: null,
    },
  });
}

/**
 * Queue state for one doctor on one date.
 * @param {string} doctorId
 * @param {string} date 'YYYY-MM-DD'
 * @returns {Promise<import('./models').Queue>}
 */
export function getQueue(doctorId, date) {
  return delay({ doctorId, date, currentNumber: 2, lastTicket: 8 });
}

/**
 * Call the next patient (increments currentNumber by 1).
 * @param {string} doctorId
 * @param {string} date
 * @returns {Promise<import('./models').Queue>}
 */
export function callNext(doctorId, date) {
  return delay({ doctorId, date, currentNumber: 3, lastTicket: 8 });
}

/**
 * Cancel an appointment (frees the slot).
 * @param {string} appointmentId
 * @returns {Promise<{ok:boolean}>}
 */
export function cancelAppointment(appointmentId) {
  return delay({ ok: true });
}

/**
 * Rate an appointment 1-5 (also updates the doctor's average rating).
 * @param {string} appointmentId
 * @param {number} rating
 * @returns {Promise<{ok:boolean, rating:number}>}
 */
export function rateAppointment(appointmentId, rating) {
  return delay({ ok: true, rating });
}

/**
 * All appointments (History page).
 * @returns {Promise<import('./models').Appointment[]>}
 */
export function getAppointments() {
  return delay([]);
}

/**
 * Booked time slots for a doctor on a date (Calendar).
 * @param {string} doctorId
 * @param {string} date
 * @returns {Promise<string[]>} e.g. ['09:20', '09:40']
 */
export function getBookedSlots(doctorId, date) {
  return delay([]);
}
