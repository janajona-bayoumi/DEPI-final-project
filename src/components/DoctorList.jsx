import DoctorCard from "./DoctorCard";

export default function DoctorList({
  doctors,
  selectedId,
  onSelect,
  onReset,
}) {
  if (doctors.length === 0) {
    return (
      <div className="text-center my-4">
        <p className="text-muted">
          No doctors match this specialty.
        </p>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onReset}
        >
          Show all doctors
        </button>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {doctors.map((doctor) => (
        <div className="col-12 col-lg-6" key={doctor.id}>
          <DoctorCard
            doctor={doctor}
           
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
