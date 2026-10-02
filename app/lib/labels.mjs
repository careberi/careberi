// Single source of truth for how enum values and hours are shown to people.
// Imported by the form (to render), validation (to derive allow-lists), and the
// lead email (to label rows), so the three can't drift apart.

export const REASON_OPTIONS = [
  { value: "general", label: "Learn more about our services" },
  { value: "probono", label: "Pro bono care (careberi care)" },
  { value: "partner", label: "Partnership inquiry" },
];

export const CARE_NEEDS_OPTIONS = [
  { value: "household_tasks", label: "Household tasks", desc: "Errands, housekeeping and meal prep." },
  { value: "personal_care", label: "Personal care", desc: "Bathing, dressing and feeding." },
  { value: "companionship", label: "Companionship", desc: "Sharing hobbies and lending an ear." },
  { value: "transportation", label: "Transportation", desc: "Trips to appointments and errands." },
  { value: "specialized_care", label: "Specialized care", desc: "Intellectual disability, memory support." },
  { value: "mobility_assistance", label: "Mobility assistance", desc: "Lift, transfers, physical activity, etc." },
];

export const CARE_TYPE_OPTIONS = [
  { value: "recurring", label: "Recurring" },
  { value: "one_time", label: "One-time" },
  { value: "live_in", label: "Live-in" },
];

export const RECIPIENT_OPTIONS = [
  { value: "parent", label: "My parent" },
  { value: "spouse", label: "My spouse" },
  { value: "adult_child", label: "My adult child" },
  { value: "friend_relative", label: "My friend/extended relative" },
  { value: "myself", label: "Myself" },
];

export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export const AGE_RANGE_OPTIONS = [
  { value: "20s", label: "20's" },
  { value: "30s", label: "30's" },
  { value: "40s", label: "40's" },
  { value: "50s", label: "50's" },
  { value: "60s", label: "60's" },
  { value: "70s", label: "70's" },
  { value: "80s", label: "80's" },
  { value: "90s_plus", label: "90's+" },
];

export function labelFor(options, value) {
  const hit = options.find((o) => o.value === value);
  return hit ? hit.label : null;
}

// 24 is the end of the day, not the start of one: `24 % 24` would read "12:00 AM"
// and make a full-day range look like a zero-length one.
export function formatHour(h) {
  if (Number(h) === 24) return "midnight";
  const hh = Number(h) % 24;
  const period = hh >= 12 ? "PM" : "AM";
  let hour12 = hh % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:00 ${period}`;
}
