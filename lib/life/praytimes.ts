/**
 * Offline prayer-time calculation (PrayTimes.org algorithm, single pass).
 * Defaults match the Moroccan Ministry method: Fajr 19°, Isha 17°, Asr Shafi'i.
 */
import type { PrayerTimes } from "./plan";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const fix = (a: number, b: number) => {
  const x = a - b * Math.floor(a / b);
  return x < 0 ? x + b : x;
};

function julian(y: number, m: number, d: number) {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sun(jd: number) {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g)), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  const eqt = q / 15 - fix(RA, 24);
  const decl = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));
  return { decl, eqt };
}

export type CalcOptions = { fajr: number; isha: number; tune?: Partial<Record<keyof PrayerTimes, number>> };

export const MOROCCO: CalcOptions = { fajr: 19, isha: 17, tune: { dhuhr: 5, maghrib: 5 } };

/** `tzHours` overrides the device time zone (used on the server, which runs in UTC). */
export function calcPrayerTimes(date: Date, lat: number, lng: number, opts: CalcOptions = MOROCCO, tzHours?: number): PrayerTimes {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const tz = tzHours ?? -new Date(y, m - 1, d, 12).getTimezoneOffset() / 60;
  const jd = julian(y, m, d) - lng / (15 * 24);

  const at = (t: number) => sun(jd + t / 24);
  const noon = (t: number) => fix(12 - at(t).eqt, 24);
  const angleTime = (angle: number, t: number, ccw: boolean) => {
    const { decl } = at(t);
    const n = noon(t);
    const cosT = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat)));
    const T = deg(Math.acos(Math.max(-1, Math.min(1, cosT)))) / 15;
    return n + (ccw ? -T : T);
  };
  const asrTime = (t: number) => {
    const { decl } = at(t);
    const angle = -deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - decl))))));
    return angleTime(angle, t, false);
  };

  const raw = {
    fajr: angleTime(opts.fajr, 5, true),
    sunrise: angleTime(0.833, 6, true),
    dhuhr: noon(12),
    asr: asrTime(13),
    maghrib: angleTime(0.833, 18, false),
    isha: angleTime(opts.isha, 18, false),
  };

  const out: PrayerTimes = {};
  for (const [k, v] of Object.entries(raw)) {
    const minutes = Math.round((v + tz - lng / 15) * 60 + (opts.tune?.[k as keyof PrayerTimes] ?? 0));
    const mm = fix(minutes, 1440);
    out[k as keyof PrayerTimes] = `${String(Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
  }
  return out;
}

export const CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
  { name: "Rabat", lat: 34.0209, lng: -6.8416 },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811 },
  { name: "Fes", lat: 34.0181, lng: -5.0078 },
  { name: "Tanger", lat: 35.7595, lng: -5.834 },
  { name: "Agadir", lat: 30.4278, lng: -9.5981 },
  { name: "Meknes", lat: 33.8935, lng: -5.5473 },
  { name: "Oujda", lat: 34.6814, lng: -1.9086 },
  { name: "Kenitra", lat: 34.261, lng: -6.5802 },
  { name: "Tetouan", lat: 35.5889, lng: -5.3626 },
  { name: "El Jadida", lat: 33.2316, lng: -8.5007 },
  { name: "Safi", lat: 32.2994, lng: -9.2372 },
  { name: "Beni Mellal", lat: 32.3373, lng: -6.3498 },
  { name: "Nador", lat: 35.1681, lng: -2.9335 },
  { name: "Laayoune", lat: 27.1253, lng: -13.1625 },
];
