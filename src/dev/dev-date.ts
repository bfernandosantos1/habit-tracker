// Module-level simulated date for dev/testing.
// When null, todayKey() uses the real date.

let simulatedDate: string | null = null;
let listeners: Array<() => void> = [];

export function getSimulatedDate(): string | null {
  return simulatedDate;
}

export function setSimulatedDate(date: string | null) {
  simulatedDate = date;
  listeners.forEach((fn) => fn());
}

export function onDateChange(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
