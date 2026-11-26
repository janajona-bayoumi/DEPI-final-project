import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getBookedSlots } from "../services";
import BookingConfirmModal from "./BookingConfirmModal";
import "./SlotCalendar.css";

const pad = (n) => String(n).padStart(2, "0");

const toDateString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (minutes) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const time12 = { hour: "numeric", minute: "2-digit", hour12: true };

function getDaysBetween(start, end) {
  const days = [];
  const day = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (day < end) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }
  return days;
}

function buildEvents(doctor, days, bookedByDate) {
  const { daysOfWeek, startTime, endTime } = doctor.businessHours;
  const first = toMinutes(startTime);
  const last = toMinutes(endTime);
  const now = new Date();
  const events = [];

  days.forEach((day) => {
    if (!daysOfWeek.includes(day.getDay())) return;

    const date = toDateString(day);
    const taken = bookedByDate[date] || [];

    for (
      let t = first;
      t + doctor.slotDuration <= last;
      t += doctor.slotDuration
    ) {
      const slotStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        Math.floor(t / 60),
        t % 60,
      );
      if (slotStart <= now) continue;

      const time = toTime(t);
      const isBooked = taken.includes(time);

      events.push({
        id: `${date}_${time}`,
        title: isBooked ? "Booked" : "Available",
        start: `${date}T${time}:00`,
        end: `${date}T${toTime(t + doctor.slotDuration)}:00`,
        classNames: [isBooked ? "slot-booked" : "slot-available"],
        extendedProps: { date, time, isBooked },
      });
    }
  });

  return events;
}

export default function SlotCalendar({ doctor }) {
  const navigate = useNavigate();
  const [range, setRange] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const hiddenDays = [0, 1, 2, 3, 4, 5, 6].filter(
    (d) => !doctor.businessHours.daysOfWeek.includes(d),
  );

  useEffect(() => {
    if (!range) return;
    let ignore = false;

    async function loadSlots() {
      setLoading(true);
      setError("");
      try {
        const days = getDaysBetween(range.start, range.end);
        const results = await Promise.all(
          days.map((day) => getBookedSlots(doctor.id, toDateString(day))),
        );
        if (ignore) return;

        const bookedByDate = {};
        days.forEach((day, i) => {
          bookedByDate[toDateString(day)] = results[i];
        });
        setEvents(buildEvents(doctor, days, bookedByDate));
      } catch (err) {
        console.error("Failed to load slots:", err);
        if (!ignore)
          setError("Couldn't load the available times. Please try again.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSlots();
    return () => {
      ignore = true;
    };
  }, [doctor, range, reloadKey]);

  function handleEventClick(info) {
    const { date, time, isBooked } = info.event.extendedProps;
    if (isBooked) return;
    setSelectedSlot({ date, time });
  }

  function handleBooked(appointment) {
    setSelectedSlot(null);
    navigate("/queue", { state: { appointment, doctor } });
  }

  return (
    <div className="slot-calendar card border-0 shadow-sm p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="fw-bold mb-1">Pick a time with {doctor.name}</h5>
          <p className="text-secondary small mb-0">
            {doctor.specialty} · {doctor.slotDuration}-minute appointments
          </p>
        </div>
        {loading && (
          <span
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          />
        )}
      </div>

      <div className="slot-legend mb-3">
        <span>
          <span className="legend-dot legend-available" />
          Available
        </span>
        <span>
          <span className="legend-dot legend-booked" />
          Booked
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        allDaySlot={false}
        nowIndicator
        height="auto"
        hiddenDays={hiddenDays}
        slotDuration={{ minutes: doctor.slotDuration }}
        slotMinTime={doctor.businessHours.startTime}
        slotMaxTime={doctor.businessHours.endTime}
        slotLabelFormat={time12}
        eventTimeFormat={time12}
        displayEventEnd={false}
        dayHeaderFormat={{ weekday: "short", day: "numeric", month: "short" }}
        businessHours={doctor.businessHours}
        validRange={{ start: toDateString(new Date()) }}
        events={events}
        eventClick={handleEventClick}
        datesSet={(info) => setRange({ start: info.start, end: info.end })}
      />

      {selectedSlot && (
        <BookingConfirmModal
          doctor={doctor}
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onFailed={() => setReloadKey((k) => k + 1)}
          onDone={handleBooked}
        />
      )}
    </div>
  );
}
