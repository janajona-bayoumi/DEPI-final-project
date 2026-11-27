export default function QueueStatusCard({
  doctor,
  date,
  queue,
  ticketNumber,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="card shadow-sm border-0 p-4 text-center">
        <p className="text-secondary mb-0">Loading queue status...</p>
      </div>
    );
  }

  if (!doctor || !queue) {
    return (
      <div className="card shadow-sm border-0 p-4 text-center">
        <p className="text-secondary mb-0">
          No queue data available yet. Select a doctor or book an appointment first.
        </p>
      </div>
    );
  }

  const waitingCount = Math.max(0, Number(queue.waiting ?? 0));
  const slotDuration = Number(doctor.slotDuration ?? 15);
  const estimatedMinutes = waitingCount * slotDuration;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <span className="badge bg-primary-subtle text-primary mb-1">
              LIVE QUEUE
            </span>
            <h4 className="fw-bold mb-1">{doctor.name}</h4>
            <p className="text-secondary small mb-0">
              Specialty: {doctor.specialty} — Date: {date}
            </p>
          </div>
          <span className="badge bg-light text-dark border">
            Slot duration: {slotDuration} min
          </span>
        </div>

        <div className="row g-3 text-center mt-2">
          <div className="col-6 col-md-3">
            <div className="p-3 rounded bg-light border">
              <div className="text-secondary small">Current Number</div>
              <div className="fs-3 fw-bold text-primary">
                {queue.currentNumber > 0 ? `#${queue.currentNumber}` : "Not started"}
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="p-3 rounded bg-light border">
              <div className="text-secondary small">Your Ticket</div>
              <div className="fs-3 fw-bold text-dark">
                {ticketNumber ? `#${ticketNumber}` : "—"}
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="p-3 rounded bg-light border">
              <div className="text-secondary small">Patients Ahead</div>
              <div className="fs-3 fw-bold text-warning-emphasis">
                {waitingCount}
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="p-3 rounded bg-light border">
              <div className="text-secondary small">Estimated Wait</div>
              <div className="fs-3 fw-bold text-success">
                {estimatedMinutes} min
              </div>
            </div>
          </div>
        </div>

        {ticketNumber && waitingCount === 0 && queue.currentNumber === ticketNumber && (
          <div className="alert alert-success mt-3 mb-0">
            It is your turn now! Please head to the doctor&apos;s room.
          </div>
        )}

        {ticketNumber && waitingCount > 0 && waitingCount <= 2 && (
          <div className="alert alert-warning mt-3 mb-0">
            Your turn is coming up soon! {waitingCount}{" "}
            {waitingCount === 1 ? "patient" : "patients"} ahead of you.
          </div>
        )}
      </div>
    </div>
  );
}