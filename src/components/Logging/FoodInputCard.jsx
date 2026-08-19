/**
 * FoodInputCard.jsx — The Logging Panel.
 *
 * Two modes of food entry:
 *   1. Manual: User types food name + weight, submits the form.
 *   2. Image Upload (simulated): Button calls simulateImageUpload()
 *      from context, which returns a random mock food. The inputs are
 *      auto-filled with the mock values — the user can edit them before
 *      confirming the log.
 *
 * Error handling: validation errors from calculateMeal() are caught
 * and displayed inline (not as browser alerts) so the UX stays smooth.
 */
import { useState, useRef, useCallback } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';

export function FoodInputCard() {
  const { addMeal, simulateImageUpload } = useTracker();

  const [foodName, setFoodName]   = useState('');
  const [weight, setWeight]       = useState('');
  const [error, setError]         = useState('');
  const [isScanning, setIsScanning] = useState(false); // Simulated loading state
  const [scanLabel, setScanLabel]   = useState('');     // Shows what was "scanned"

  const formRef   = useRef(null);
  const inputRef  = useRef(null);

  // ── Simulate Image Upload ──────────────────────────────────────────
  const handleImageUpload = useCallback(() => {
    setIsScanning(true);
    setError('');
    setScanLabel('');

    // Simulate a brief AI "processing" delay for realism
    setTimeout(() => {
      const mock = simulateImageUpload();
      setFoodName(mock.name);
      setWeight(String(mock.weight));
      setScanLabel(`📸 Detected: ${mock.name} (${mock.weight}g)`);
      setIsScanning(false);
      inputRef.current?.focus();
    }, 900);
  }, [simulateImageUpload]);

  // ── Submit Handler ─────────────────────────────────────────────────
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');

    try {
      addMeal(foodName, weight);
      // Clear inputs on success
      setFoodName('');
      setWeight('');
      setScanLabel('');
    } catch (err) {
      // Display the descriptive error from validateWeight / calculateMeal
      setError(err.message);
      // Shake the form for tactile feedback
      formRef.current?.classList.add('animate-shake');
      setTimeout(() => formRef.current?.classList.remove('animate-shake'), 400);
    }
  }, [foodName, weight, addMeal]);

  return (
    <div className="panel panel--log">
      <p className="panel-label">Log a Meal</p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        {/* ── Food Name ── */}
        <div className="form-group">
          <label htmlFor="food-name-input" className="form-label">
            Food Item
          </label>
          <input
            id="food-name-input"
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="e.g. Chicken Breast, Oats…"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            autoComplete="off"
            aria-describedby={error ? 'log-error' : undefined}
          />
        </div>

        {/* ── Portion Weight ── */}
        <div className="form-group">
          <label htmlFor="weight-input" className="form-label">
            Portion Weight (grams)
          </label>
          <input
            id="weight-input"
            type="number"
            className="form-input"
            placeholder="e.g. 150"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min={1}
            max={5000}
            aria-describedby={error ? 'log-error' : undefined}
          />
        </div>

        {/* ── Error Display ── */}
        {error && (
          <p id="log-error" className="form-error" role="alert" aria-live="assertive">
            ⚠️ {error}
          </p>
        )}

        {/* ── Scan Result Label ── */}
        {scanLabel && !error && (
          <p className="scan-label" aria-live="polite">
            {scanLabel}
          </p>
        )}

        {/* ── Action Buttons ── */}
        <div className="log-actions">
          {/* Image Upload simulation */}
          <button
            id="image-upload-btn"
            type="button"
            className="btn btn--secondary btn--image-upload"
            onClick={handleImageUpload}
            disabled={isScanning}
            aria-label="Simulate AI food photo scanner"
          >
            {isScanning ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Scanning…
              </>
            ) : (
              <>
                <span aria-hidden="true">📷</span>
                Image Upload
              </>
            )}
          </button>

          {/* Submit */}
          <button
            id="log-meal-btn"
            type="submit"
            className="btn btn--primary btn--log"
            disabled={isScanning}
          >
            <span aria-hidden="true">+</span>
            Log Meal
          </button>
        </div>
      </form>
    </div>
  );
}
