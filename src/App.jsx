/**
 * App.jsx — Root application shell (fully wired with profile support).
 */
import { TrackerProvider } from './context/TrackerContext.jsx';
import { useTracker } from './context/TrackerContext.jsx';
import { FitnessGoalToggle } from './components/UI/FitnessGoalToggle.jsx';
import { ProgressBar } from './components/Dashboard/ProgressBar.jsx';
import { MacroMeters } from './components/Dashboard/MacroMeters.jsx';
import { FoodInputCard } from './components/Logging/FoodInputCard.jsx';
import { MealList } from './components/History/MealList.jsx';
import { WarningModal } from './components/UI/WarningModal.jsx';
import { ProfileModal } from './components/UI/ProfileModal.jsx';
import './index.css';

function AppLayout() {
  const { openProfileModal, userProfile, tdee } = useTracker();

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb--1" aria-hidden="true" />
      <div className="bg-orb bg-orb--2" aria-hidden="true" />
      <div className="bg-orb bg-orb--3" aria-hidden="true" />

      <div className="app-container">
        {/* ── HEADER ── */}
        <header className="app-header">
          <div className="header-brand">
            <span className="brand-icon" aria-hidden="true">🔥</span>
            <h1 className="brand-title">NutriTrack</h1>
            <span className="brand-subtitle">Daily Macro Dashboard</span>
          </div>

          <div className="header-right">
            {/* Profile chip — shows TDEE when profile is set */}
            <button
              id="open-profile-btn"
              className="btn btn--secondary profile-chip"
              onClick={openProfileModal}
              aria-label="Edit your profile to recalculate calorie targets"
              title="Edit profile"
            >
              <span aria-hidden="true">👤</span>
              {userProfile ? (
                <span className="profile-chip__stats">
                  {tdee} kcal TDEE
                  <span className="profile-chip__dot" aria-hidden="true" />
                  {userProfile.weightKg}kg · {userProfile.heightCm}cm
                </span>
              ) : (
                <span>Set Profile</span>
              )}
            </button>

            <FitnessGoalToggle />
          </div>
        </header>

        {/* ── DASHBOARD ── */}
        <section className="dashboard-zone" aria-label="Nutrition Dashboard">
          <div className="dashboard-card">
            <ProgressBar />
            <div className="divider" />
            <MacroMeters />
          </div>
        </section>

        {/* ── CONTENT GRID ── */}
        <div className="content-grid">
          <FoodInputCard />
          <MealList />
        </div>
      </div>

      <WarningModal />
      <ProfileModal />
    </div>
  );
}

function App() {
  return (
    <TrackerProvider>
      <AppLayout />
    </TrackerProvider>
  );
}

export default App;
