import type {
  AreaKey,
  Block,
  DayLog,
  LifeState,
  PrayerKey,
  PrayerStatus,
  Profile,
  SetLog,
} from "./types";

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftDate(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dateKey(dt);
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const WEEKDAYS = ["L7ed", "Tnin", "Tlat", "Larb3", "Lkhmis", "Jem3a", "Sebt"];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* Areas of life                                                       */
/* ------------------------------------------------------------------ */

export const AREAS: Record<AreaKey, { label: string; color: string }> = {
  deen: { label: "Dine", color: "#C9A66B" },
  sa7a: { label: "Sa7a & Gym", color: "#7FB77E" },
  khedma: { label: "Khedma", color: "#6FA8DC" },
  ta3allom: { label: "Ta3allom", color: "#B48EDB" },
  "3a2ila": { label: "3a2ila & Nas", color: "#E59A7A" },
  ra7a: { label: "Ra7a & N3as", color: "#8A8580" },
};

/* ------------------------------------------------------------------ */
/* Prayers                                                             */
/* ------------------------------------------------------------------ */

export const PRAYERS: { key: PrayerKey; label: string; api: string }[] = [
  { key: "fajr", label: "Sbo7 (Fajr)", api: "Fajr" },
  { key: "dhuhr", label: "Dhor", api: "Dhuhr" },
  { key: "asr", label: "L3asr", api: "Asr" },
  { key: "maghrib", label: "Lmaghrib", api: "Maghrib" },
  { key: "isha", label: "L3cha", api: "Isha" },
];

export const PRAYER_STATUS: { key: PrayerStatus; label: string; points: number }[] = [
  { key: "jamaa", label: "F jama3a", points: 1 },
  { key: "ontime", label: "F lwa9t", points: 0.85 },
  { key: "late", label: "M3etel", points: 0.4 },
  { key: "missed", label: "Fatetni", points: 0 },
];

export type PrayerTimes = Partial<Record<PrayerKey | "sunrise", string>>;

/* ------------------------------------------------------------------ */
/* Training                                                            */
/* ------------------------------------------------------------------ */

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: [number, number];
  rest: number; // seconds
  tip: string;
  /** reps are seconds held instead of repetitions */
  timed?: boolean;
};

const EX: Record<string, Omit<Exercise, "sets" | "reps">> = {
  bench: { id: "bench", name: "Bench press (barre)", rest: 150, tip: "Kotfin lteht w lor, rjlik tabtin f l2ard." },
  incline_db: { id: "incline_db", name: "Incline dumbbell press", rest: 120, tip: "Banc 30°, hbet b chwiya 2-3 tawani." },
  incline_bb: { id: "incline_bb", name: "Incline bench press", rest: 150, tip: "Barre katnzel l fou9 sder." },
  ohp: { id: "ohp", name: "Overhead press", rest: 120, tip: "Sedd kerch w tiz, ma t3wejch dahrek." },
  db_shoulder: { id: "db_shoulder", name: "Dumbbell shoulder press", rest: 120, tip: "Ma tsedch lfo9 ga3 bach tb9a tension." },
  lateral: { id: "lateral", name: "Lateral raise", rest: 60, tip: "Wzen khfif, control, l coude 9dam chwiya." },
  fly: { id: "fly", name: "Cable / pec-deck fly", rest: 75, tip: "Stretch mzyan f lteht, squeeze f lwest." },
  pushdown: { id: "pushdown", name: "Triceps pushdown", rest: 60, tip: "Coudes msedin m3a jnab." },
  oh_triceps: { id: "oh_triceps", name: "Overhead triceps extension", rest: 75, tip: "Stretch kamel mor rasek." },
  pullup: { id: "pullup", name: "Pull-up / Lat pulldown", rest: 120, tip: "Jbed b coudes, sder l fou9." },
  row: { id: "row", name: "Barbell row", rest: 120, tip: "Dahr msta9im, jbed l kerch." },
  cable_row: { id: "cable_row", name: "Seated cable row", rest: 90, tip: "Hbes 1s f squeeze." },
  cs_row: { id: "cs_row", name: "Chest-supported row", rest: 90, tip: "Ma t3awnch b jsdek." },
  facepull: { id: "facepull", name: "Face pull", rest: 60, tip: "Jbed l wjhek w 7el yeddik l barra." },
  curl: { id: "curl", name: "Barbell / EZ curl", rest: 75, tip: "Ma tswingich, coudes tabtin." },
  hammer: { id: "hammer", name: "Hammer curl", rest: 60, tip: "Kaybni brachialis — dra3 kayghla9." },
  squat: { id: "squat", name: "Back squat", rest: 180, tip: "Nzel 7ta lfkhad parallèle, rkabi m3a sabi3." },
  rdl: { id: "rdl", name: "Romanian deadlift", rest: 150, tip: "Dfe3 tiz lor, stretch f hamstrings." },
  deadlift: { id: "deadlift", name: "Deadlift", rest: 180, tip: "Barre lassa9 m3a rjlik, dahr neutre." },
  legpress: { id: "legpress", name: "Leg press", rest: 120, tip: "Ma tsedch rkabi f lfo9." },
  legcurl: { id: "legcurl", name: "Leg curl", rest: 75, tip: "Control f nzoul (3 tawani)." },
  legext: { id: "legext", name: "Leg extension", rest: 75, tip: "Hbes 1s f lfo9." },
  bss: { id: "bss", name: "Bulgarian split squat", rest: 90, tip: "Rjel lor 3la banc, nzel ntit." },
  lunge: { id: "lunge", name: "Walking lunges", rest: 90, tip: "Khatwa twila l glutes." },
  calf: { id: "calf", name: "Calf raise", rest: 60, tip: "Stretch kamel + hbes f lfo9." },
  plank: { id: "plank", name: "Plank", rest: 45, tip: "Kerch mzyar, ma t9ttchi tiz.", timed: true },
  legraise: { id: "legraise", name: "Hanging leg raise", rest: 60, tip: "Ma tswingich." },
};

function ex(id: string, sets: number, lo: number, hi: number): Exercise {
  return { ...EX[id], sets, reps: [lo, hi] };
}

export type WorkoutKey = "push" | "pull" | "legs" | "upper" | "lower" | "fullA" | "fullB";

export const WORKOUTS: Record<WorkoutKey, { name: string; focus: string; exercises: Exercise[] }> = {
  push: {
    name: "Push",
    focus: "Sder · Ktaf · Triceps",
    exercises: [ex("bench", 4, 6, 10), ex("incline_db", 3, 8, 12), ex("ohp", 3, 8, 10), ex("lateral", 4, 12, 20), ex("fly", 3, 12, 15), ex("pushdown", 3, 10, 15)],
  },
  pull: {
    name: "Pull",
    focus: "Dahr · Biceps",
    exercises: [ex("pullup", 4, 6, 10), ex("row", 4, 8, 10), ex("cable_row", 3, 10, 12), ex("facepull", 3, 15, 20), ex("curl", 3, 8, 12), ex("hammer", 3, 10, 15)],
  },
  legs: {
    name: "Legs",
    focus: "Rjlin · Core",
    exercises: [ex("squat", 4, 6, 10), ex("rdl", 3, 8, 10), ex("legpress", 3, 10, 15), ex("legcurl", 3, 10, 15), ex("calf", 4, 12, 20), ex("plank", 3, 30, 60)],
  },
  upper: {
    name: "Upper",
    focus: "Jesm l fo9ani",
    exercises: [ex("incline_bb", 4, 6, 10), ex("pullup", 4, 8, 10), ex("db_shoulder", 3, 8, 12), ex("cs_row", 3, 10, 12), ex("lateral", 3, 15, 20), ex("curl", 3, 10, 12), ex("oh_triceps", 3, 10, 12)],
  },
  lower: {
    name: "Lower",
    focus: "Jesm t7tani",
    exercises: [ex("deadlift", 3, 5, 8), ex("bss", 3, 8, 12), ex("legext", 3, 12, 15), ex("legcurl", 3, 10, 15), ex("calf", 4, 10, 15), ex("legraise", 3, 10, 15)],
  },
  fullA: {
    name: "Full body A",
    focus: "Jesm kaml",
    exercises: [ex("squat", 3, 6, 10), ex("bench", 3, 6, 10), ex("row", 3, 8, 10), ex("ohp", 3, 8, 10), ex("curl", 2, 10, 12), ex("plank", 3, 30, 60)],
  },
  fullB: {
    name: "Full body B",
    focus: "Jesm kaml",
    exercises: [ex("rdl", 3, 8, 10), ex("incline_db", 3, 8, 12), ex("pullup", 3, 8, 12), ex("lunge", 3, 10, 12), ex("lateral", 3, 12, 20), ex("pushdown", 3, 10, 15)],
  },
};

/** index = Date.getDay() (0 = L7ed) */
const SPLITS: Record<Profile["trainingDays"], (WorkoutKey | null)[]> = {
  3: [null, "fullA", null, "fullB", null, "fullA", null],
  4: [null, "upper", "lower", null, "upper", "lower", null],
  5: [null, "push", "pull", "legs", null, "upper", "lower"],
  6: [null, "push", "pull", "legs", "push", "pull", "legs"],
};

export function workoutFor(profile: Profile, key: string): WorkoutKey | null {
  return SPLITS[profile.trainingDays][fromKey(key).getDay()];
}

export function weekPlan(profile: Profile): (WorkoutKey | null)[] {
  return SPLITS[profile.trainingDays];
}

/** Most recent logged sets for an exercise before `beforeKey`. */
export function lastSets(state: LifeState, exId: string, beforeKey: string): { date: string; sets: SetLog[] } | null {
  const keys = Object.keys(state.days).filter((k) => k < beforeKey).sort().reverse();
  for (const k of keys) {
    const s = state.days[k].sets?.[exId]?.filter((x) => x.w > 0 || x.r > 0);
    if (s && s.length) return { date: k, sets: s };
  }
  return null;
}

/** Progressive overload suggestion. */
export function overloadHint(e: Exercise, last: { sets: SetLog[] } | null): string {
  if (!last) return e.timed ? `Bda b ${e.reps[0]}s` : "Awel mrra: khtar wzen t9der dir bih " + e.reps[1] + " reps b technique n9ia.";
  const top = Math.max(...last.sets.map((s) => s.w));
  const allTop = last.sets.length >= e.sets && last.sets.every((s) => s.r >= e.reps[1]);
  if (e.timed) return `Lmrra li fatet ${Math.max(...last.sets.map((s) => s.r))}s → zid 5-10s.`;
  if (allTop) return `Drt ${e.reps[1]} reps f ga3 sets b ${top}kg → zid l ${top + 2.5}kg lyoum 💪`;
  return `Lmrra li fatet ${top}kg → b9a f nefs l wzen w zid rep wa7da f kol set.`;
}

/* ------------------------------------------------------------------ */
/* Nutrition                                                           */
/* ------------------------------------------------------------------ */

export type Food = { id: string; name: string; unit: string; kcal: number; protein: number; carbs: number; fat: number };

export const FOODS: Food[] = [
  { id: "bid", name: "Bid", unit: "1 bida", kcal: 75, protein: 6.5, carbs: 0.5, fat: 5 },
  { id: "khobz", name: "Khobz kamel", unit: "rbe3 khobza", kcal: 140, protein: 5.5, carbs: 26, fat: 1.5 },
  { id: "chofan", name: "Chofan (oats)", unit: "50g", kcal: 190, protein: 6.5, carbs: 33, fat: 3.5 },
  { id: "7lib", name: "7lib", unit: "kas 250ml", kcal: 160, protein: 8, carbs: 12, fat: 9 },
  { id: "raib", name: "Raib / Lben", unit: "1 kas", kcal: 120, protein: 7, carbs: 10, fat: 6 },
  { id: "djaj", name: "Djaj (blanc)", unit: "100g mtyob", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "l7am", name: "L7am bgri", unit: "100g mtyob", kcal: 250, protein: 26, carbs: 0, fat: 15 },
  { id: "kefta", name: "Kefta", unit: "100g", kcal: 260, protein: 20, carbs: 2, fat: 19 },
  { id: "sardine", name: "Sardine", unit: "1 boita", kcal: 220, protein: 25, carbs: 0, fat: 13 },
  { id: "thon", name: "Thon", unit: "1 boita", kcal: 110, protein: 25, carbs: 0, fat: 1 },
  { id: "7out", name: "7out", unit: "150g", kcal: 180, protein: 32, carbs: 0, fat: 5 },
  { id: "rouz", name: "Rouz", unit: "100g mtyob", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "pates", name: "Pâtes", unit: "100g mtyobin", kcal: 155, protein: 5.5, carbs: 31, fat: 1 },
  { id: "batata", name: "Batata", unit: "200g", kcal: 170, protein: 4, carbs: 38, fat: 0.2 },
  { id: "l3des", name: "L3des", unit: "1 zlafa", kcal: 230, protein: 18, carbs: 40, fat: 1 },
  { id: "loubia", name: "Loubia", unit: "1 zlafa", kcal: 250, protein: 15, carbs: 45, fat: 1 },
  { id: "tajine", name: "Tajine djaj", unit: "1 portion", kcal: 450, protein: 35, carbs: 20, fat: 25 },
  { id: "couscous", name: "Couscous", unit: "1 tobsil", kcal: 600, protein: 25, carbs: 90, fat: 15 },
  { id: "7rira", name: "7rira", unit: "1 zlafa", kcal: 200, protein: 10, carbs: 30, fat: 4 },
  { id: "msemen", name: "Msemen", unit: "1", kcal: 300, protein: 6, carbs: 40, fat: 13 },
  { id: "banane", name: "Banane", unit: "1", kcal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: "tfa7", name: "Tfa7a", unit: "1", kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: "tmer", name: "Tmer", unit: "3 tmrat", kcal: 70, protein: 0.6, carbs: 18, fat: 0 },
  { id: "louz", name: "Louz / Gerga3", unit: "30g", kcal: 175, protein: 6, carbs: 6, fat: 15 },
  { id: "pb", name: "Zebda kawkaw", unit: "1 m3al9a", kcal: 95, protein: 4, carbs: 3, fat: 8 },
  { id: "zit", name: "Zit zitoun", unit: "1 m3al9a", kcal: 120, protein: 0, carbs: 0, fat: 14 },
  { id: "jben", name: "Jben / Fromage", unit: "30g", kcal: 80, protein: 5, carbs: 1, fat: 6 },
  { id: "avocat", name: "Avocat", unit: "nos", kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "whey", name: "Whey", unit: "1 scoop", kcal: 120, protein: 24, carbs: 3, fat: 1.5 },
  { id: "salade", name: "Chlada", unit: "1 tobsil", kcal: 60, protein: 2, carbs: 10, fat: 2 },
];

export const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]));

export function targets(p: Profile) {
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "m" ? 5 : -161);
  const maintenance = Math.round(bmr * p.activity);
  const kcal = Math.round((maintenance + p.surplus) / 10) * 10;
  const protein = Math.round(p.weightKg * 2);
  const fat = Math.round(p.weightKg * 0.9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: Math.round(bmr), maintenance, kcal, protein, fat, carbs };
}

type PlanItem = { food: string; qty: number };
const MEAL_TEMPLATE: { time: string; name: string; items: PlanItem[] }[] = [
  { time: "07:30", name: "Ftour", items: [{ food: "bid", qty: 3 }, { food: "khobz", qty: 1 }, { food: "avocat", qty: 1 }, { food: "7lib", qty: 1 }] },
  { time: "11:00", name: "Snack", items: [{ food: "raib", qty: 1 }, { food: "banane", qty: 1 }, { food: "louz", qty: 1 }] },
  { time: "14:00", name: "Lghda", items: [{ food: "djaj", qty: 2 }, { food: "rouz", qty: 2 }, { food: "salade", qty: 1 }, { food: "zit", qty: 1 }] },
  { time: "17:00", name: "9bel l gym", items: [{ food: "chofan", qty: 1 }, { food: "banane", qty: 1 }, { food: "pb", qty: 1 }, { food: "7lib", qty: 1 }] },
  { time: "21:00", name: "L3cha", items: [{ food: "thon", qty: 1 }, { food: "bid", qty: 2 }, { food: "khobz", qty: 1 }, { food: "salade", qty: 1 }] },
];

function sumItems(items: PlanItem[]) {
  return items.reduce(
    (a, it) => {
      const f = FOOD_BY_ID[it.food];
      return { kcal: a.kcal + f.kcal * it.qty, protein: a.protein + f.protein * it.qty };
    },
    { kcal: 0, protein: 0 },
  );
}

/** Builds a Moroccan lean-bulk meal plan scaled to the kcal target. */
export function mealPlan(p: Profile) {
  const t = targets(p);
  const base = MEAL_TEMPLATE.reduce((a, m) => a + sumItems(m.items).kcal, 0);
  const factor = t.kcal / base;
  return MEAL_TEMPLATE.map((m) => {
    const items = m.items.map((it) => {
      const f = FOOD_BY_ID[it.food];
      // salad & oil stay fixed; everything else scales, rounded to halves
      const scalable = !["salade", "zit"].includes(it.food);
      const qty = scalable ? Math.max(0.5, Math.round(it.qty * factor * 2) / 2) : it.qty;
      return { ...f, qty };
    });
    const tot = sumItems(items.map((i) => ({ food: i.id, qty: i.qty })));
    return { ...m, items, kcal: Math.round(tot.kcal), protein: Math.round(tot.protein) };
  });
}

export function dayTotals(log: DayLog) {
  return log.meals.reduce(
    (a, m) => ({ kcal: a.kcal + m.kcal, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_PROFILE: Profile = {
  name: "Ayoub",
  sex: "m",
  age: 25,
  heightCm: 178,
  weightKg: 70,
  goalWeightKg: 78,
  activity: 1.55,
  surplus: 300,
  trainingDays: 5,
  city: "Casablanca",
  country: "Morocco",
  quranGoalPages: 4,
  waterGoal: 10,
};

export const DEFAULT_SCHEDULE: Block[] = [
  { id: "b1", start: "05:45", end: "06:30", title: "Sbo7 + adhkar sabah + Qur2an", area: "deen" },
  { id: "b2", start: "06:30", end: "07:30", title: "Sport khfif / mchi + douch", area: "sa7a" },
  { id: "b3", start: "07:30", end: "08:00", title: "Ftour + planifier nhar", area: "sa7a" },
  { id: "b4", start: "08:00", end: "12:30", title: "Deep work (bla telephone)", area: "khedma" },
  { id: "b5", start: "12:30", end: "13:00", title: "Dhor", area: "deen" },
  { id: "b6", start: "13:00", end: "14:00", title: "Lghda + ra7a", area: "ra7a" },
  { id: "b7", start: "14:00", end: "16:30", title: "Khedma: meetings / tournage / montage", area: "khedma" },
  { id: "b8", start: "16:30", end: "17:00", title: "L3asr + snack", area: "deen" },
  { id: "b9", start: "17:00", end: "18:30", title: "Gym", area: "sa7a" },
  { id: "b10", start: "18:45", end: "19:15", title: "Lmaghrib + adhkar masa", area: "deen" },
  { id: "b11", start: "19:15", end: "20:15", title: "Ta3allom: ktab / course", area: "ta3allom" },
  { id: "b12", start: "20:15", end: "21:30", title: "L3cha (salat) + 3cha m3a l3a2ila", area: "3a2ila" },
  { id: "b13", start: "21:30", end: "22:30", title: "Review nhar + to-do dyal ghedda", area: "ra7a" },
  { id: "b14", start: "22:30", end: "05:30", title: "N3as (7h+)", area: "ra7a" },
];

export function emptyDay(): DayLog {
  return {
    prayers: {},
    sunnah: 0,
    adhkar: { sabah: false, masa: false },
    quranPages: 0,
    workoutDone: false,
    sets: {},
    meals: [],
    water: 0,
    sleepHours: null,
    weight: null,
    tasks: [],
    blocksDone: {},
    note: "",
  };
}

export function defaultState(): LifeState {
  return { version: 1, profile: DEFAULT_PROFILE, schedule: DEFAULT_SCHEDULE, days: {} };
}

/* ------------------------------------------------------------------ */
/* Productivity score                                                  */
/* ------------------------------------------------------------------ */

export type ScorePart = { key: string; label: string; got: number; max: number; color: string };

export function scoreDay(state: LifeState, key: string): { total: number; parts: ScorePart[] } {
  const log = state.days[key] ?? emptyDay();
  const p = state.profile;
  const t = targets(p);
  const clamp = (x: number) => Math.max(0, Math.min(1, x));

  const prayerPts = PRAYERS.reduce((a, pr) => {
    const st = log.prayers[pr.key];
    return a + (st ? PRAYER_STATUS.find((s) => s.key === st)!.points : 0);
  }, 0);
  const extraDeen =
    (log.adhkar.sabah ? 0.25 : 0) + (log.adhkar.masa ? 0.25 : 0) + clamp(log.quranPages / Math.max(1, p.quranGoalPages)) * 0.5;

  const trainingDay = workoutFor(p, key) !== null;
  const gym = trainingDay ? (log.workoutDone ? 1 : 0) : 1;

  const tot = dayTotals(log);
  const kcalRatio = tot.kcal / t.kcal;
  const kcalScore = kcalRatio > 1.15 ? clamp(1 - (kcalRatio - 1.15) * 2) : clamp(kcalRatio / 0.95);
  const food = (kcalScore + clamp(tot.protein / t.protein)) / 2;

  const blocks = state.schedule.length;
  const doneBlocks = state.schedule.filter((b) => log.blocksDone[b.id]).length;
  const tasks = log.tasks.length;
  const doneTasks = log.tasks.filter((x) => x.done).length;
  const work = blocks + tasks === 0 ? 0 : (doneBlocks + doneTasks) / (blocks + tasks);

  const water = clamp(log.water / Math.max(1, p.waterGoal));
  const sleep = log.sleepHours == null ? 0 : log.sleepHours >= 7 && log.sleepHours <= 9 ? 1 : log.sleepHours >= 6 ? 0.6 : 0.2;

  const parts: ScorePart[] = [
    { key: "salat", label: "Salat", got: (prayerPts / 5) * 30, max: 30, color: AREAS.deen.color },
    { key: "deen", label: "Qur2an & adhkar", got: extraDeen * 8, max: 8, color: "#E3C99A" },
    { key: "nhar", label: "Planning & tasks", got: work * 25, max: 25, color: AREAS.khedma.color },
    { key: "gym", label: "Gym", got: gym * 15, max: 15, color: AREAS.sa7a.color },
    { key: "makla", label: "Makla", got: food * 12, max: 12, color: "#E5C07B" },
    { key: "ma", label: "Lma", got: water * 5, max: 5, color: "#5BC0EB" },
    { key: "n3as", label: "N3as", got: sleep * 5, max: 5, color: AREAS.ta3allom.color },
  ];
  const total = Math.round(parts.reduce((a, x) => a + x.got, 0));
  return { total, parts };
}

/* ------------------------------------------------------------------ */
/* Streaks & trends                                                    */
/* ------------------------------------------------------------------ */

export function prayerStreak(state: LifeState, today: string): number {
  let n = 0;
  let k = today;
  // today counts only if complete; otherwise start from yesterday
  const full = (key: string) => {
    const d = state.days[key];
    return !!d && PRAYERS.every((p) => d.prayers[p.key] && d.prayers[p.key] !== "missed");
  };
  if (!full(k)) k = shiftDate(k, -1);
  while (full(k)) {
    n++;
    k = shiftDate(k, -1);
  }
  return n;
}

export function weightTrend(state: LifeState, today: string) {
  const avg = (from: number, to: number) => {
    const vals: number[] = [];
    for (let i = from; i < to; i++) {
      const w = state.days[shiftDate(today, -i)]?.weight;
      if (w) vals.push(w);
    }
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const thisWeek = avg(0, 7);
  const lastWeek = avg(7, 14);
  return { thisWeek, lastWeek, perWeek: thisWeek != null && lastWeek != null ? thisWeek - lastWeek : null };
}

/* ------------------------------------------------------------------ */
/* Coach                                                               */
/* ------------------------------------------------------------------ */

export type Tip = { tone: "good" | "warn" | "info"; title: string; text: string };

export function coachTips(state: LifeState, key: string, now: Date, times: PrayerTimes): Tip[] {
  const tips: Tip[] = [];
  const p = state.profile;
  const log = state.days[key] ?? emptyDay();
  const t = targets(p);
  const tot = dayTotals(log);
  const mins = now.getHours() * 60 + now.getMinutes();
  const isToday = key === dateKey(now);

  // Next prayer
  if (isToday) {
    const next = PRAYERS.find((pr) => times[pr.key] && toMinutes(times[pr.key]!) > mins);
    const pending = PRAYERS.filter((pr) => times[pr.key] && toMinutes(times[pr.key]!) <= mins && !log.prayers[pr.key]);
    if (pending.length)
      tips.push({ tone: "warn", title: "Salat", text: `Ma sejeltich: ${pending.map((x) => x.label).join(", ")}. Ila ma salitich — 9oum sali daba 🤲` });
    if (next) {
      const diff = toMinutes(times[next.key]!) - mins;
      tips.push({ tone: "info", title: "Salat jaya", text: `${next.label} f ${times[next.key]} (ba9i ${Math.floor(diff / 60)}h${String(diff % 60).padStart(2, "0")}). Wajed rasek 9bel b 10 d9aye9.` });
    }
  }

  // Training
  const w = workoutFor(p, key);
  if (w && !log.workoutDone) {
    const wk = WORKOUTS[w];
    tips.push({ tone: "info", title: `Lyoum: ${wk.name}`, text: `${wk.focus} — ${wk.exercises.length} tamarin. Kol 1-2h 9bel: carbs + protein (chofan + banane + 7lib).` });
  } else if (w && log.workoutDone) {
    tips.push({ tone: "good", title: "Gym ✓", text: "Mzyan! Daba: 30-40g protein f s3a w n3as mzyan bach l3adalat tkber." });
  } else {
    tips.push({ tone: "info", title: "Nhar ra7a", text: "L3adalat katkber f ra7a. Mchi 30 d9i9a, stretching, w kol mzyan — ma tn9ssch l makla." });
  }

  // Nutrition (scaled by time of day)
  const dayFrac = isToday ? Math.min(1, Math.max(0, (mins - 7 * 60) / (14 * 60))) : 1;
  const protLeft = Math.round(t.protein - tot.protein);
  const kcalLeft = Math.round(t.kcal - tot.kcal);
  if (tot.protein < t.protein * dayFrac * 0.8 && protLeft > 0) {
    const chicken = Math.round((protLeft / 31) * 100);
    tips.push({ tone: "warn", title: "Protein na9es", text: `Ba9i lik ${protLeft}g protein. Ex: ${Math.min(chicken, 300)}g djaj, wla ${Math.ceil(protLeft / 25)} boitat thon, wla bid + raib.` });
  } else if (protLeft <= 0) {
    tips.push({ tone: "good", title: "Protein ✓", text: `Wselti ${Math.round(tot.protein)}g protein lyoum. Top.` });
  }
  if (kcalLeft > 0 && tot.kcal < t.kcal * dayFrac * 0.75) {
    tips.push({ tone: "warn", title: "Calories", text: `Ba9i ${kcalLeft} kcal bach tzid f l3adalat. Ila ma 3ndekch chahiya: 7lib + banane + louz + chofan f blender (~700 kcal).` });
  }

  // Water
  const waterExpected = Math.round(p.waterGoal * dayFrac);
  if (isToday && log.water < waterExpected - 1) tips.push({ tone: "warn", title: "Lma", text: `Chrebti ${log.water}/${p.waterGoal} kisan. Chreb 2 daba.` });

  // Weight trend
  const tr = weightTrend(state, key);
  if (tr.perWeek != null) {
    if (tr.perWeek < 0.1 && p.goalWeightKg > p.weightKg)
      tips.push({ tone: "warn", title: "L wazn wa9ef", text: `Simana hadi ${tr.perWeek >= 0 ? "+" : ""}${tr.perWeek.toFixed(2)}kg. Zid +150 kcal f surplus (f Settings).` });
    else if (tr.perWeek > 0.6)
      tips.push({ tone: "warn", title: "Kattzid bzaf", text: `+${tr.perWeek.toFixed(2)}kg/simana — ghaliban chi chi7am. N9ss 100-150 kcal.` });
    else if (tr.perWeek >= 0.1)
      tips.push({ tone: "good", title: "Lean bulk ✓", text: `+${tr.perWeek.toFixed(2)}kg/simana — hada howa rythme mzyan (0.25-0.5).` });
  } else {
    tips.push({ tone: "info", title: "Wzen rasek", text: "Wzen rasek kol sba7 (mor twalet, 9bel makla) bach coach y3ref wach khassek tzid calories." });
  }

  // Sleep
  if (log.sleepHours != null && log.sleepHours < 7)
    tips.push({ tone: "warn", title: "N3as", text: `${log.sleepHours}h ma kafyach. L3adalat katbna f n3as — 7-9h, n3es 9bel 23h.` });

  // Quran
  if (log.quranPages < p.quranGoalPages)
    tips.push({ tone: "info", title: "Qur2an", text: `Ba9i ${p.quranGoalPages - log.quranPages} sf7at mn l wird dyalek. Mor kol salat sf7a = sahl.` });

  return tips;
}

/* ------------------------------------------------------------------ */
/* Area time split                                                     */
/* ------------------------------------------------------------------ */

export function blockMinutes(b: Block): number {
  let d = toMinutes(b.end) - toMinutes(b.start);
  if (d <= 0) d += 24 * 60;
  return d;
}

export function areaSplit(schedule: Block[]) {
  const out = Object.fromEntries(Object.keys(AREAS).map((k) => [k, 0])) as Record<AreaKey, number>;
  for (const b of schedule) out[b.area] += blockMinutes(b);
  return out;
}
