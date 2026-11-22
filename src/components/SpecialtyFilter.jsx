import { SPECIALTIES } from "../services";

export default function SpecialtyFilter({ selectedSpecialty, onChange }) {
  return (
    <div className="mb-4">
      <label className="form-label fw-semibold">
        Filter by Specialty
      </label>

      <select
        className="form-select"
        value={selectedSpecialty}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Specialties</option>

        {SPECIALTIES.map((specialty) => (
          <option key={specialty} value={specialty}>
            {specialty}
          </option>
        ))}
      </select>
    </div>
  );
}