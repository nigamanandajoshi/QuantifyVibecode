# 🔥 NutriTrack — Calorie & Macro Dashboard

> A **science-backed, real-time** daily food journal built with React + Vite. Track calories, manage macros, and get instant visual feedback — all powered by the Mifflin-St Jeor TDEE equation personalised to your body stats.

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 🧮 **TDEE Calculator** | Personalised calorie targets via Mifflin-St Jeor BMR formula |
| 🎯 **Fitness Goal Toggle** | Switch between Weight Loss, Maintenance & Muscle Gain instantly |
| 📊 **Live Progress Bars** | Calorie + 3 macro bars that update in real-time with every meal |
| 🍽️ **Smart Meal Logger** | Type any food OR use the simulated AI photo scanner to auto-fill |
| 🚨 **Budget Alerts** | Amber near-limit warning at ≤100 kcal · Crimson exceeded modal |
| 🗑️ **Meal History** | Scrollable daily log with instant delete and undo via "Skip Meal" |
| 💎 **Premium UI** | Glassmorphism, gradient tokens, 6 micro-animations, fully responsive |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/nigamanandajoshi/QuantifyVibecode.git
cd QuantifyVibecode

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

> **First launch:** A profile setup modal will appear automatically. Enter your stats to get personalised calorie targets.

---

## 🏗️ Architecture

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React 19 (Vite) | Component model + `useMemo` for zero-cost derived state |
| **State** | React Context API | Avoids prop drilling; single source of truth |
| **Styling** | Vanilla CSS | Full design token control, glassmorphism, no build overhead |
| **Math** | Mifflin-St Jeor (1990) | Most validated BMR equation for general adult populations |

### Directory Structure

```
src/
├── App.jsx                          ← Root shell + TrackerProvider
├── main.jsx                         ← Vite entry point
├── index.css                        ← Full design system (~1100 lines)
│
├── components/
│   ├── Dashboard/
│   │   ├── ProgressBar.jsx          ← Dynamic calorie bar (3 visual states)
│   │   └── MacroMeters.jsx          ← Protein / Carbs / Fats progress bars
│   ├── History/
│   │   ├── MealList.jsx             ← Scrollable daily meal log
│   │   └── MealItem.jsx             ← Single row with macro chips + delete
│   ├── Logging/
│   │   └── FoodInputCard.jsx        ← Manual entry + Image Upload simulation
│   └── UI/
│       ├── FitnessGoalToggle.jsx    ← Vibe Check — goal pill switcher
│       ├── WarningModal.jsx         ← Budget exceeded overlay
│       └── ProfileModal.jsx         ← TDEE profile setup window
│
├── context/
│   └── TrackerContext.jsx           ← All state, derived values & actions
│
└── utils/
    ├── tdeeCalculator.js            ← Mifflin-St Jeor BMR + TDEE engine
    ├── nutrientCalculator.js        ← Nutrient scaling algorithm
    ├── mockDatabase.js              ← 20-food nutrition database
    ├── goalConfig.js                ← Static goal metadata & fallback limits
    └── uuid.js                      ← Zero-dep UUID v4 via Web Crypto API
```

---

## 🧮 The Science Behind the Numbers

### TDEE Calculation (Mifflin-St Jeor, 1990)

```
BMR (Male)   = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
BMR (Female) = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161

TDEE = BMR × Activity Multiplier
```

| Activity Level | Multiplier | Description |
|---|---|---|
| Sedentary | × 1.2 | Desk job, little or no exercise |
| Lightly Active | × 1.375 | Light exercise 1–3 days/week |
| Moderately Active | × 1.55 | Moderate exercise 3–5 days/week |
| Very Active | × 1.725 | Hard exercise 6–7 days/week |
| Athlete | × 1.9 | Physical job or 2× daily training |

### Goal Adjustments

| Goal | Calorie Delta | Rationale |
|---|---|---|
| 🏃 Weight Loss | TDEE − 500 kcal | ~0.5 kg/week safe deficit |
| ⚖️ Maintenance | TDEE | Match energy expenditure |
| 💪 Muscle Gain | TDEE + 300 kcal | Lean bulk surplus |

### Macro Splits (% of goal calories)

| Goal | Protein | Carbs | Fats |
|---|---|---|---|
| Weight Loss | 40% | 35% | 25% |
| Maintenance | 30% | 45% | 25% |
| Muscle Gain | 35% | 45% | 20% |

> Conversion: Protein & Carbs = 4 kcal/g · Fats = 9 kcal/g · Safety floor: 1,200 kcal minimum

---

## 🍽️ Nutrient Scaling Algorithm

The core engine in `nutrientCalculator.js` uses the formula:

```
Nutrient = (Base Value per 100g / 100) × Portion Weight (g)
```

**Self-evaluated against 5 edge cases before shipping:**

| # | Edge Case | Resolution |
|---|---|---|
| 1 | `weight = 0g` | Hard reject — throws `"at least 1g"` validation error |
| 2 | `weight = -50g` | Same guard catches all non-positive values |
| 3 | `weight > 5000g` | Hard cap — `"cannot exceed 5000g"` |
| 4 | FP drift `6.20000001` | `Math.round(v × 10) / 10` applied at scale AND after summation |
| 5 | Unknown food | `lookupFood()` returns `FALLBACK_NUTRIENT_PROFILE` — no `NaN` |

---

## 🎨 Design System

The entire UI is token-driven from `index.css`:

```css
/* All colors, spacing, radius, typography defined as CSS variables */
:root {
  --gradient-brand: linear-gradient(135deg, #667eea, #764ba2);
  --color-progress-safe-start: #22d3ee;
  --color-progress-danger-end: #dc143c;   /* Crimson */
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-blur: blur(20px);
  /* ... 40+ tokens */
}
```

### Progress Bar States

```
0% ──────── 75% ──────── 100% ──────── 100%+
  [Safe: Teal] [Warn: Amber] [Danger: Crimson + Pulse]
```

### Animations

| Keyframe | Used On |
|---|---|
| `shimmer` | Progress bar fill sweep |
| `dangerPulse` | Crimson bar + budget modal icon |
| `fadeInUp` | New meal rows, near-limit banner |
| `modalEnter` | Both modals (spring easing) |
| `orbFloat` | Background ambient depth orbs |
| `shake` | Form validation error feedback |

---

## 🗂️ State Architecture

```
TrackerContext
│
├── meals[]                ← Logged food items (source of truth)
├── activeGoalKey          ← 'weightLoss' | 'maintenance' | 'muscleGain'
├── userProfile            ← { weightKg, heightCm, age, gender, activityLevel }
│
├── DERIVED (useMemo — never stored)
│   ├── tdee               ← Mifflin-St Jeor output from profile
│   ├── allGoalTargets     ← { weightLoss, maintenance, muscleGain } limits from TDEE
│   ├── activeGoal         ← Static metadata + dynamic limits for current key
│   ├── totals             ← Sum of all meals' calories/protein/carbs/fats
│   ├── isOverBudget       ← totals.calories > activeGoal.maxCalories
│   └── isNearLimit        ← remaining ≤ 100 kcal AND !isOverBudget
│
└── ACTIONS
    ├── addMeal(name, weight)
    ├── deleteMeal(id)
    ├── skipLastMeal()       ← Undo last entry (from budget modal)
    ├── setGoal(key)         ← Swaps limits, never touches meals[]
    ├── saveProfile(profile) ← Triggers full TDEE recalculation
    └── simulateImageUpload()← Returns random mock from IMAGE_UPLOAD_MOCKS
```

**Key design principle:** `meals[]` and `activeGoalKey` and `userProfile` are fully independent state slices. Switching goal or updating profile **never wipes logged meals.**

---

## 🔔 Alert System

Three non-overlapping warning states, ordered by severity:

```
1. isNearLimit  (≤100 kcal left)  → Amber inline banner slides in below progress bar
2. isOverBudget (0 kcal left)     → isNearLimit turns OFF; Crimson bar + modal appears
```

**Budget Exceeded Modal — two exit paths:**
- **🥗 Skip This Meal** — removes the last logged entry so the user can swap it for something lighter
- **I'll Manage It** — dismisses, leaves all data intact (user owns the decision)

---

## 🍕 Food Database

20 foods across 5 categories, all per 100g:

| Category | Foods |
|---|---|
| Proteins | Chicken Breast, Salmon, Tuna, Eggs, Greek Yogurt |
| Carbs | White Rice, Brown Rice, Oats, Banana, Sweet Potato, Whole Wheat Bread |
| Fats | Avocado, Almonds, Peanut Butter, Olive Oil |
| Vegetables | Broccoli, Spinach |
| Mixed | Avocado Toast, Pizza, Burger |

Unknown foods fall back to a **generic nutrient profile** (150 kcal / 10g P / 18g C / 5g F per 100g).

---

## 🛠️ Development

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## 📄 License

MIT © [Nigamananda Joshi](https://github.com/nigamanandajoshi)

---

<div align="center">
  <sub>Built with ❤️ using React + Vite + Vanilla CSS · Powered by Mifflin-St Jeor science</sub>
</div>
