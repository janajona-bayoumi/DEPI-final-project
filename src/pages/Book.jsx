
import { useState, useEffect } from "react";
import { getDoctors } from "../services";
import DoctorList from "../components/DoctorList";
import SpecialtyFilter from "../components/SpecialtyFilter";

export default function Book({ onDoctorSelect }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors(specialty = "") {
    setLoading(true);
    setError("");

    try {
      const data = await getDoctors(specialty);
      setDoctors(data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError("Unable to load doctors. Please try again.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectDoctor(doctor) {
    setSelectedDoctor(doctor);
    onDoctorSelect?.(doctor);
  }

  function handleSpecialtyChange(specialty) {
    setSelectedSpecialty(specialty);
    setSelectedDoctor(null);
    onDoctorSelect?.(null);

    loadDoctors(specialty);
  }

  function handleReset() {
    setSelectedSpecialty("");
    setSelectedDoctor(null);
    onDoctorSelect?.(null);

    loadDoctors();
  }

  return (
    <main className="min-vh-100 bg-light">
      <section className="container py-5">

        {/* Section Heading */}
        <div className="mb-4">
          <span className="text-primary fw-bold small">
            OUR SPECIALISTS
          </span>

          <h2 className="fw-bold mt-2 mb-2">
            Meet Our Doctors
          </h2>

          <p className="text-secondary">
            Choose from our qualified medical professionals.
          </p>
        </div>

        {/* Specialty Filter */}
        <div className="mb-4">
          <SpecialtyFilter
            selectedSpecialty={selectedSpecialty}
            onChange={handleSpecialtyChange}
          />
        </div>

        {/* Doctors List */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>

            <p className="text-secondary mb-0">
              Loading doctors...
            </p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">
            <p className="mb-3">{error}</p>

            <button
              className="btn btn-outline-danger"
              onClick={() => loadDoctors(selectedSpecialty)}
            >
              Try Again
            </button>
          </div>
        ) : (
          <DoctorList
            doctors={doctors}
            onSelect={handleSelectDoctor}
            onReset={handleReset}
          />
        )}
      </section>
    </main>
  );
}
