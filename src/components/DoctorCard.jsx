export default function DoctorCard({ doctor, onSelect }) {
  const colors = [
    { bg: "#e0f2fe", text: "#0369a1" },
    { bg: "#fce7f3", text: "#be185d" },
    { bg: "#dcfce7", text: "#15803d" },
    { bg: "#fef3c7", text: "#b45309" },
    { bg: "#ede9fe", text: "#6d28d9" },
    { bg: "#ffedd5", text: "#c2410c" },
    { bg: "#cffafe", text: "#0e7490" },
  ];

  const colorIndex = [...doctor.id].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  ) % colors.length;

  const initials = doctor.name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className="card h-100 shadow-sm rounded-4 border-0"
      style={{
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="card-body p-4">


        {/* Doctor Information */}
        
        <div className="d-flex align-items-center gap-3 mb-4">
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="rounded-circle"
              width="65"
              height="65"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 flex-shrink-0"
              style={{
                width: "65px",
                height: "65px",
                backgroundColor: colors[colorIndex].bg,
                color: colors[colorIndex].text,
              }}
            >
              {initials}
            </div>
          )}

          <div>
            <h5 className="card-title mb-1">
              {doctor.name}
            </h5>

            <p className="text-muted mb-2">
              {doctor.specialty}
            </p>

            <div>
              <span className="text-warning">★</span>
              <strong className="ms-1">
                {doctor.rating}
              </strong>

              <small className="text-muted ms-1">
                ({doctor.ratingCount} reviews)
              </small>
            </div>
          </div>
        </div>

        {/* Appointment Duration */}
        <p className="text-muted small mb-3">
          Appointment duration: {doctor.slotDuration} minutes
        </p>

        <hr />

        {/* Book Button */}
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-primary px-4 py-2"
            onClick={() => onSelect(doctor)}
          >
            Book now <span className="ms-2">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}
