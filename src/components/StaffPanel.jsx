export default function StaffPanel({
  doctor,
  date,
  queue,
  onCallNext,
  calling = false,
  error = "",
}) {
  if (!doctor || !queue) {
    return (
      <div className="card shadow-sm border-0 p-4 text-center">
        <p className="text-secondary mb-0">Select a doctor to view the staff panel.</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <span className="badge bg-dark mb-1">STAFF PANEL</span>
            <h4 className="fw-bold mb-1">{doctor.name}</h4>
            <p className="text-secondary small mb-0">
              Date: {date} — Last issued ticket: #{queue.lastTicket ?? 0}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg px-4"
            onClick={onCallNext}
            disabled={calling}
          >
            {calling ? "Calling next..." : "Call Next Patient"}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-3 text-center">
          <div className="col-sm-6">
            <div className="p-3 rounded bg-light border">
              <div className="text-secondary small">Current Ticket (In Progress)</div>
              <div className="fs-2 fw-bold text-primary">
                {queue.currentNumber > 0 ? `#${queue.currentNumber}` : "None"}
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="p-3 rounded bg-light border">
              <div className="text-secondary small">Waiting Patients</div>
              <div className="fs-2 fw-bold text-dark">
                {queue.waiting ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}