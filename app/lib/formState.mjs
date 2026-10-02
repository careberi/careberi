// Partners and families answer disjoint question sets. Without this, abandoning
// one branch for the other carries the first branch's answers into the lead.

export const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  phone: "",
  zip: "",
  reason: "",
  careNeeds: [],
  careType: "",
  startDate: "",
  endDate: "",
  timeStart: 9,
  timeEnd: 17,
  careRecipient: "",
  recipientGender: "female",
  recipientAgeRange: "",
  recipientNotes: "",
  caregiverPrefs: "",
  town: "",
  story: "",
  company_website: "",
};

const CARE_FIELDS = [
  "careNeeds",
  "careType",
  "startDate",
  "endDate",
  "timeStart",
  "timeEnd",
  "careRecipient",
  "recipientGender",
  "recipientAgeRange",
  "recipientNotes",
  "caregiverPrefs",
];

const PARTNER_FIELDS = ["town", "story"];

const isPartner = (reason) => reason === "partner";

export function resetBranchFields(formData, nextReason) {
  const next = { ...formData, reason: nextReason };
  const was = formData?.reason;

  // Nothing chosen yet, or staying on the same side: keep every answer.
  if (!was || isPartner(was) === isPartner(nextReason)) return next;

  const leaving = isPartner(was) ? PARTNER_FIELDS : CARE_FIELDS;
  for (const field of leaving) {
    const blank = INITIAL_FORM_DATA[field];
    next[field] = Array.isArray(blank) ? [] : blank;
  }
  return next;
}
