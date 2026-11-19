# Services API

> Single source of truth. **No component may read/write localStorage or call `fetch` directly** — everything goes through here.
> Any change to signatures or models must be announced in the team group immediately.

Import: `import { getDoctors, bookSlot } from '../services'`

## Structure

| File | Purpose |
|---|---|
| `index.js` | Public entry point. Switches between mock and real backend. |
| `mockApi.js` | Current implementation on top of localStorage. |
| `storage.js` | The only file that touches localStorage (used by `mockApi.js`). |
| `httpApi.js` | Real backend implementation (to be added later, same function names). |
| `mockData.js` | Fake doctors. Removed once the backend exists. |
| `models.js` | Data models and shared constants. |

## Models

```
Doctor      { id, name, specialty, photo|null, rating, ratingCount,
              slotDuration (minutes),
              businessHours: { daysOfWeek: [0-6], startTime: 'HH:mm', endTime: 'HH:mm' } }

Appointment { id, doctorId, date: 'YYYY-MM-DD', time: 'HH:mm', ticketNumber,
              status: 'booked' | 'in-progress' | 'done' | 'cancelled',
              rating: number | null }

Queue       { doctorId, date, currentNumber, lastTicket }
```

`daysOfWeek`: 0 = Sunday ... 6 = Saturday (same numbering as FullCalendar).

## Functions (all async, return a Promise)

| Function | Params | Returns |
|---|---|---|
| `getDoctors` | `specialty?` | `Doctor[]` |
| `bookSlot` | `{ doctorId, date, time }` | `{ ok: true, appointment }` or `{ ok: false, error: 'INVALID' \| 'PAST' \| 'CONFLICT' }` |
| `getBookedSlots` | `doctorId, date` | `string[]` e.g. `['09:20']` (Calendar) |
| `getQueue` | `doctorId, date` | `Queue` |
| `callNext` | `doctorId, date` | `Queue` |
| `getAppointments` | — | `Appointment[]` sorted by date/time (History page) |
| `cancelAppointment` | `appointmentId` | `{ ok: true }` or `{ ok: false, error: 'NOT_FOUND' \| 'INVALID' }` |
| `rateAppointment` | `appointmentId, rating (1-5)` | `{ ok: true, rating }` or `{ ok: false, error: 'NOT_FOUND' \| 'INVALID' }` |

## Behavior rules

**bookSlot**
- `INVALID`: unknown doctor, bad date/time format, day not in `daysOfWeek`, time outside working hours, or time not aligned to `slotDuration` (slots are `startTime + n × slotDuration`, and must end by `endTime`).
- `PAST`: the slot start is not in the future (local time).
- `CONFLICT`: same doctor + date + time already booked (cancelled appointments don't count).
- Ticket numbers start at 1 per (doctor + date) and are never reused, even after a cancel.

**callNext**
- Marks the current patient `done`, then moves to the next `booked` ticket (`in-progress`), skipping cancelled ones.
- If nobody is waiting, `currentNumber` stays the same.

**cancelAppointment**: only `booked` appointments can be cancelled. The slot becomes free again.

**rateAppointment**: not allowed on cancelled appointments. Re-rating replaces the old rating (rating count does not grow). `getDoctors` returns the updated average.

## Conventions (backend-ready)

- All functions are async, even the mock ones, so components never change when the backend arrives.
- Business errors are returned as `{ ok: false, error }`, not thrown.
- Dates are `'YYYY-MM-DD'`, times are `'HH:mm'` (24h).
- IDs are strings.
- Error codes live in `BOOKING_ERRORS`, statuses in `APPOINTMENT_STATUS` (both exported from `../services`).

## Queue formulas

```
waiting        = ticketNumber - currentNumber - 1
estimated wait = waiting × slotDuration
```

## Status

- [x] Models and signatures (Nov 17)
- [x] Mock doctors + stubs (Nov 18)
- [x] Real `getDoctors` and `bookSlot` on localStorage (Nov 19)
- [x] Remaining functions (Nov 20)
- [ ] `httpApi.js` when the backend is ready