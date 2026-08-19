/**
 * ProfileModal.jsx — User profile setup window.
 *
 * Collects weight, height, age, gender, and activity level.
 * On save, computes TDEE via Mifflin-St Jeor and passes the result
 * to Context, which immediately recalculates all goal limits.
 *
 * The modal is shown on first load (no profile saved) and can be
 * re-opened at any time via the header profile button.
 * Closing without saving keeps the previous profile intact.
 */
import { useState, useEffect, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';
import {
  ACTIVITY_LEVELS,
  calculateTDEE,
  validateProfile,
} from '../../utils/tdeeCalculator.js';

export function ProfileModal() {
  const { userProfile, saveProfile, showProfileModal, closeProfileModal } = useTracker();

  // Initialise form from existing profile (or blank for first-time users)
  const [form, setForm] = useState({
    weightKg:      userProfile?.weightKg      ?? '',
    heightCm:      userProfile?.heightCm      ?? '',
    age:           userProfile?.age           ?? '',
    gender:        userProfile?.gender        ?? 'male',
    activityLevel: userProfile?.activityLevel ?? 'moderate',
  });
  const [errors, setErrors]   = useState([]);
  const [preview, setPreview] = useState(null); // Live TDEE preview

  const firstInputRef = useRef(null);

  // Sync form if the profile changes externally
  useEffect(() => {
    if (userProfile) {
      setForm({
        weightKg:      userProfile.weightKg,
        heightCm:      userProfile.heightCm,
        age:           userProfile.age,
        gender:        userProfile.gender,
        activityLevel: userProfile.activityLevel,
      });
    }
  }, [userProfile]);

  // Auto-focus first field + compute live preview whenever form changes
  useEffect(() => {
    if (showProfileModal) firstInputRef.current?.focus();
  }, [showProfileModal]);

  useEffect(() => {
    const w = Number(form.weightKg);
    const h = Number(form.heightCm);
    const a = Number(form.age);
    // Only show preview when all required fields are plausible numbers
    if (w >= 20 && h >= 50 && a >= 10) {
      const tdee = calculateTDEE({
        weightKg: w, heightCm: h, age: a,
        gender: form.gender, activityLevel: form.activityLevel,
      });
      setPreview(tdee);
    } else {
      setPreview(null);
    }
  }, [form]);

  // Close on Escape (only if profile already exists — don't trap first-time users)
  useEffect(() => {
    if (!showProfileModal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && userProfile) closeProfileModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showProfileModal, userProfile, closeProfileModal]);

  if (!showProfileModal) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors([]); // Clear errors on any change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = {
      weightKg:      Number(form.weightKg),
      heightCm:      Number(form.heightCm),
      age:           Number(form.age),
      gender:        form.gender,
      activityLevel: form.activityLevel,
    };
    const validationErrors = validateProfile(parsed);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    saveProfile(parsed);
    closeProfileModal();
  };

  const isFirstTime = !userProfile;

  return (
    <div
      className="modal-backdrop profile-backdrop"
      onClick={isFirstTime ? undefined : closeProfileModal} // Can't dismiss on first-time
      aria-hidden="true"
    >
      <div
        className="modal profile-modal animate-modalEnter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="profile-modal__header">
          <span className="profile-modal__icon" aria-hidden="true">👤</span>
          <div>
            <h2 id="profile-modal-title" className="profile-modal__title">
              {isFirstTime ? 'Set Up Your Profile' : 'Update Profile'}
            </h2>
            <p className="profile-modal__subtitle">
              We'll calculate your personal calorie targets using the
              Mifflin-St Jeor equation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Row 1: Weight + Height ── */}
          <div className="profile-row">
            <div className="form-group">
              <label htmlFor="profile-weight" className="form-label">
                Weight (kg)
              </label>
              <input
                id="profile-weight"
                ref={firstInputRef}
                type="number"
                className="form-input"
                placeholder="e.g. 70"
                value={form.weightKg}
                onChange={handleChange('weightKg')}
                min={20}
                max={300}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-height" className="form-label">
                Height (cm)
              </label>
              <input
                id="profile-height"
                type="number"
                className="form-input"
                placeholder="e.g. 175"
                value={form.heightCm}
                onChange={handleChange('heightCm')}
                min={50}
                max={280}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-age" className="form-label">
                Age
              </label>
              <input
                id="profile-age"
                type="number"
                className="form-input"
                placeholder="e.g. 25"
                value={form.age}
                onChange={handleChange('age')}
                min={10}
                max={120}
              />
            </div>
          </div>

          {/* ── Gender Selector ── */}
          <div className="form-group">
            <span className="form-label">Gender</span>
            <div className="gender-pills" role="group" aria-label="Select gender">
              {[
                { value: 'male',   label: '♂ Male'   },
                { value: 'female', label: '♀ Female' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  id={`gender-${value}`}
                  className={`gender-pill ${form.gender === value ? 'gender-pill--active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, gender: value }))}
                  aria-pressed={form.gender === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Activity Level ── */}
          <div className="form-group">
            <label htmlFor="profile-activity" className="form-label">
              Activity Level
            </label>
            <div className="activity-select-wrapper">
              <select
                id="profile-activity"
                className="form-input form-select"
                value={form.activityLevel}
                onChange={handleChange('activityLevel')}
              >
                {ACTIVITY_LEVELS.map(({ key, label, description }) => (
                  <option key={key} value={key}>
                    {label} — {description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Live TDEE Preview ── */}
          {preview && (
            <div className="tdee-preview animate-fadeInUp">
              <div className="tdee-preview__col">
                <span className="tdee-preview__label">Your TDEE</span>
                <span className="tdee-preview__value">{preview} <small>kcal/day</small></span>
              </div>
              <div className="tdee-divider" />
              <div className="tdee-preview__col">
                <span className="tdee-preview__label">🏃 Weight Loss</span>
                <span className="tdee-preview__goal">{Math.max(1200, preview - 500)} kcal</span>
              </div>
              <div className="tdee-preview__col">
                <span className="tdee-preview__label">⚖️ Maintenance</span>
                <span className="tdee-preview__goal">{preview} kcal</span>
              </div>
              <div className="tdee-preview__col">
                <span className="tdee-preview__label">💪 Muscle Gain</span>
                <span className="tdee-preview__goal">{preview + 300} kcal</span>
              </div>
            </div>
          )}

          {/* ── Validation Errors ── */}
          {errors.length > 0 && (
            <ul className="profile-errors" role="alert" aria-live="assertive">
              {errors.map((err) => (
                <li key={err}>⚠️ {err}</li>
              ))}
            </ul>
          )}

          {/* ── Actions ── */}
          <div className="profile-modal__actions">
            <button id="profile-save-btn" type="submit" className="btn btn--primary modal__btn">
              <span aria-hidden="true">✓</span> Save & Calculate
            </button>
            {!isFirstTime && (
              <button
                id="profile-cancel-btn"
                type="button"
                className="btn btn--secondary modal__btn"
                onClick={closeProfileModal}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
