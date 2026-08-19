/**
 * App.jsx — Root application shell (fully wired).
 *
 * All placeholder zones are now replaced with real components.
 * The TrackerProvider wraps the entire tree so every component
 * can access context without prop drilling.
 */
import { TrackerProvider } from './context/TrackerContext.jsx';
import { FitnessGoalToggle } from './components/UI/FitnessGoalToggle.jsx';
import { ProgressBar } from './components/Dashboard/ProgressBar.jsx';
import { MacroMeters } from './components/Dashboard/MacroMeters.jsx';
import { FoodInputCard } from './components/Logging/FoodInputCard.jsx';
import { MealList } from './components/History/MealList.jsx';
import { WarningModal } from './components/UI/WarningModal.jsx';
import './index.css';

function AppLayout() {
  return (
    <div className="app-shell">
      {/* Ambient glassmorphism depth orbs */}
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
          <FitnessGoalToggle />
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

      {/* Global warning modal — rendered at root level to overlay everything */}
      <WarningModal />
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
