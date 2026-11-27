import { useState, useEffect, useCallback } from "react";
import {
  getDoctors,
  getQueue,
  getAppointments,
  subscribe,
  APPOINTMENT_STATUS,
} from "../services";
import QueueStatusCard from "../components/QueueStatusCard";

function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Queue() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [ticketNumber, setTicketNumber] = useState("");
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function initData() {
      try {
        const [doctorsList, appointmentsList] = await Promise.all([
          getDoctors(),
          getAppointments(),
        ]);

        if (!active) return;
        setDoctors(doctorsList);

        const latestActiveBooking = [...appointmentsList]
          .reverse()
          .find((a) => a.status !== APPOINTMENT_STATUS.CANCELLED);

        if (latestActiveBooking) {
          setSelectedDoctorId(latestActiveBooking.doctorId);
          setSelectedDate(latestActiveBooking.date);
          setTicketNumber(String(latestActiveBooking.ticketNumber));
        } else if (doctorsList.length > 0) {
          setSelectedDoctorId(doctorsList[0].id);
        }
      } catch (err) {
        console.error("Failed to load queue data:", err);
        if (active) setError("Unable to load queue data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    initData();
    return () => {
      active = false;
    };
  }, []);

  const parsedTicket =
    ticketNumber !== "" &&
    Number.isInteger(Number(ticketNumber)) &&
    Number(ticketNumber) > 0
      ? Number(ticketNumber)
      : undefined;

  const fetchQueueStatus = useCallback(
    async (showSpinner = false) => {
      if (!selectedDoctorId || !selectedDate) return;
      if (showSpinner) setLoading(true);

      try {
        const data = await getQueue(selectedDoctorId, selectedDate, parsedTicket);
        setQueue(data);
        setError("");
      } catch (err) {
        console.error("Failed to refresh queue status:", err);
        setError("Failed to refresh queue status.");
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [selectedDoctorId, selectedDate, parsedTicket]
  );

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    fetchQueueStatus(true);

    const intervalId = setInterval(() => {
      fetchQueueStatus(false);
    }, 3000);

    const unsubscribe = subscribe(() => {
      fetchQueueStatus(false);
    });

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [selectedDoctorId, selectedDate, fetchQueueStatus]);

  const selectedDoctor =
    doctors.find((d) => d.id === selectedDoctorId) || null;

  return (
    <main className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="mb-4">
          <span className="text-primary fw-bold small">QUEUE TRACKER</span>
          <h2 className="fw-bold mt-2 mb-1">Live Queue Status</h2>
          <p className="text-secondary mb-0">
            Updates automatically every 3 seconds and syncs across browser tabs.
          </p>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body row g-3">
            <div className="col-md-5">
              <label className="form-label small fw-semibold">Doctor</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Ticket Number</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 1"
                className="form-control"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <QueueStatusCard
          doctor={selectedDoctor}
          date={selectedDate}
          queue={queue}
          ticketNumber={parsedTicket}
          loading={loading}
        />
      </div>
    </main>
  );
}