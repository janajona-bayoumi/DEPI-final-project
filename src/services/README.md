# Services API

> Single source of truth. **No component may read/write localStorage or call `fetch` directly** — everything goes through here.
> Any change to signatures or models must be announced in the team group immediately.

Import: `import { getDoctors, bookSlot } from '../services'`

## Structure

| File          | Purpose                                                               |
| ------------- | --------------------------------------------------------------------- |
| `index.js`    | Public entry point. Switches between mock and real backend.           |
| `mockApi.js`  | Fake/localStorage implementation (current).                           |
| `httpApi.js`  | Real backend implementation (to be added later, same function names). |
| `mockData.js` | Fake doctors. Removed once the backend exists.                        |
| `models.js`   | Data models and shared constants.                                     |

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

| Function            | Params                        | Returns                                                                                  |
| ------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `getDoctors`        | `specialty?`                  | `Doctor[]`                                                                               |
| `bookSlot`          | `{ doctorId, date, time }`    | `{ ok: true, appointment }` or `{ ok: false, error: 'CONFLICT' \| 'PAST' \| 'INVALID' }` |
| `getQueue`          | `doctorId, date`              | `Queue`                                                                                  |
| `callNext`          | `doctorId, date`              | `Queue` (after incrementing `currentNumber`)                                             |
| `cancelAppointment` | `appointmentId`               | `{ ok }`                                                                                 |
| `rateAppointment`   | `appointmentId, rating (1-5)` | `{ ok, rating }`                                                                         |
| `getAppointments`   | —                             | `Appointment[]` (History page)                                                           |
| `getBookedSlots`    | `doctorId, date`              | `string[]` e.g. `['09:20']` (Calendar)                                                   |

## Conventions (backend-ready)

- All functions are async, even the mock ones, so components never change when the backend arrives.
- Business errors are returned as `{ ok: false, error }`, not thrown.
- Dates are `'YYYY-MM-DD'`, times are `'HH:mm'` (24h).
- IDs are strings.

## Queue formulas

```
waiting        = ticketNumber - currentNumber - 1
estimated wait = waiting × slotDuration
```

## Status

- [x] Models and signatures (Nov 17)
- [x] Mock doctors + stubs (Nov 18)
- [ ] Real `getDoctors` and `bookSlot` on localStorage (Nov 19)
- [ ] Remaining functions (Nov 20)
- [ ] `httpApi.js` when the backend is ready
