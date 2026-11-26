import { useState } from "react";
import { bookSlot, BOOKING_ERRORS } from "../services";
import Button from "./Button";

const errorMessages = {
  [BOOKING_ERRORS.CONFLICT]:
    "Someone just booked this time. Please pick another slot.",
  [BOOKING_ERRORS.PAST]:
    "This time has already passed. Please pick a later slot.",
  [BOOKING_ERRORS.INVALID]:
    "This slot isn't available. Please pick another one.",
};

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BookingConfirmModal({
  doctor,
  slot,
  onClose,
  onFailed,
  onDone,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError("");

    try {
      const result = await bookSlot({
        doctorId: doctor.id,
        date: slot.date,
        time: slot.time,
      });

      if (result.ok) {
        setAppointment(result.appointment);
      } else {
        setError(
          errorMessages[result.error] ||
            "Something went wrong. Please try again.",
        );
        onFailed?.();
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {appointment ? "Booking confirmed" : "Confirm your booking"}
              </h5>
              {!appointment && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onClose}
                />
              )}
            </div>

            <div className="modal-body">
              {appointment ? (
                <div className="text-center py-2">
                  <p className="text-secondary mb-1">Your ticket number</p>
                  <div className="display-3 fw-bold text-primary">
                    {appointment.ticketNumber}
                  </div>
                  <p className="text-secondary mb-0">
                    {formatDate(appointment.date)} at{" "}
                    {formatTime(appointment.time)}
                  </p>
                </div>
              ) : (
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-secondary">Doctor</span>
                    <strong>{doctor.name}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-secondary">Date</span>
                    <strong>{formatDate(slot.date)}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-secondary">Time</span>
                    <strong>{formatTime(slot.time)}</strong>
                  </li>
                </ul>
              )}

              {error && (
                <div className="alert alert-danger mt-3 mb-0">{error}</div>
              )}
            </div>

            <div className="modal-footer">
              {appointment ? (
                <Button onClick={() => onDone(appointment)}>
                  Go to my queue
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    {error ? "Close" : "Cancel"}
                  </Button>
                  {!error && (
                    <Button onClick={handleConfirm} disabled={submitting}>
                      {submitting ? "Booking..." : "Confirm"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
