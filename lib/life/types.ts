export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerStatus = "jamaa" | "ontime" | "late" | "missed";

export type AreaKey = "deen" | "sa7a" | "khedma" | "ta3allom" | "3a2ila" | "ra7a";

export type Profile = {
  name: string;
  sex: "m" | "f";
  age: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  /** BMR multiplier (1.2 → 1.9) */
  activity: number;
  /** Lean-bulk surplus above maintenance, kcal */
  surplus: number;
  trainingDays: 3 | 4 | 5 | 6;
  city: string;
  country: string;
  quranGoalPages: number;
  waterGoal: number;
};

export type SetLog = { w: number; r: number };

export type Meal = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Task = { id: string; text: string; area: AreaKey; done: boolean };

export type Block = {
  id: string;
  start: string; // "HH:MM"
  end: string;
  title: string;
  area: AreaKey;
};

export type DayLog = {
  prayers: Partial<Record<PrayerKey, PrayerStatus>>;
  sunnah: number; // rawatib / extra
  adhkar: { sabah: boolean; masa: boolean };
  quranPages: number;
  workoutDone: boolean;
  sets: Record<string, SetLog[]>;
  meals: Meal[];
  water: number;
  sleepHours: number | null;
  weight: number | null;
  tasks: Task[];
  blocksDone: Record<string, boolean>;
  note: string;
};

export type LifeState = {
  version: 1;
  profile: Profile;
  schedule: Block[];
  days: Record<string, DayLog>;
};
