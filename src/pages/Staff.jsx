import { useState, useEffect, useCallback } from "react";
import { getDoctors, getQueue, callNext, subscribe } from "../services";
import StaffPanel from "../components/StaffPanel";

function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Staff() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [queue, setQueue] = useState(null);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialDoctors() {
      try {
        const list = await getDoctors();
        if (!active) return;
        setDoctors(list);
        if (list.length > 0) {
          setSelectedDoctorId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load doctors for staff page:", err);
        if (active) setError("Unable to load doctors list.");
      }
    }

    loadInitialDoctors();
    return () => {
      active = false;
    };
  }, []);

  const loadQueue = useCallback(async () => {
    if (!selectedDoctorId || !selectedDate) return;
    try {
      const data = await getQueue(selectedDoctorId, selectedDate);
      setQueue(data);
    } catch (err) {
      console.error("Failed to load staff queue:", err);
      setError("Unable to load queue data.");
    }
  }, [selectedDoctorId, selectedDate]);

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;
    loadQueue();
    const unsubscribe = subscribe(() => {
      loadQueue();
    });
    return () => unsubscribe();
  }, [selectedDoctorId, selectedDate, loadQueue]);

  async function handleCallNext() {
    if (!selectedDoctorId || !selectedDate || calling) return;
    setCalling(true);
    setError("");
    try {
      const updatedQueue = await callNext(selectedDoctorId, selectedDate);
      setQueue(updatedQueue);
    } catch (err) {
      console.error("Failed to call next patient:", err);
      setError("Error calling next patient.");
    } finally {
      setCalling(false);
    }
  }

  const selectedDoctor =
    doctors.find((d) => d.id === selectedDoctorId) || null;

  return (
    <main className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="mb-4">
          <span className="text-primary fw-bold small">CLINIC OPERATIONS</span>
          <h2 className="fw-bold mt-2 mb-1">Staff Queue Management</h2>
          <p className="text-secondary mb-0">
            Call the next patient and update the live queue immediately.
          </p>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body row g-3">
            <div className="col-md-6">
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

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <StaffPanel
          doctor={selectedDoctor}
          date={selectedDate}
          queue={queue}
          onCallNext={handleCallNext}
          calling={calling}
          error={error}
        />
      </div>
    </main>
  );
}