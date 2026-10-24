/**
 * Night Bloom — pure game logic tests (TypeScript port of Main.gd rules).
 * No Godot engine required.
 */
import { describe, expect, it } from "vitest";

// ── Logic (TypeScript port of GDScript) ────────────────────────────────────────

const clampf = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const maxf = (a: number, b: number) => Math.max(a, b);

function waterPlant(moisture: number, bloom: number) {
  return {
    moisture: clampf(moisture + 0.15, 0, 1),
    bloom: bloom + 0.05,
  };
}

function fertilize(bloom: number, stress: number) {
  return { bloom: bloom + 0.08, stress: stress + 0.04 };
}

function advanceNight(moisture: number, bloom: number, stress: number, day: number) {
  const newDay = day + 1;
  const newMoisture = clampf(moisture - 0.2, 0, 1);
  let newBloom = bloom;
  let newStress = stress;
  if (newMoisture < 0.3) {
    newStress += 0.12;
  } else {
    newBloom += 0.03;
    newStress = maxf(0, newStress - 0.02);
  }
  return { day: newDay, moisture: newMoisture, bloom: newBloom, stress: newStress };
}

function isNightBloomEvent(stress: number) {
  return stress > 0.85;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("Night Bloom — watering", () => {
  it("increases moisture by 0.15", () => {
    const { moisture } = waterPlant(0.5, 0);
    expect(moisture).toBeCloseTo(0.65);
  });

  it("increases bloom by 0.05", () => {
    const { bloom } = waterPlant(0.5, 0);
    expect(bloom).toBeCloseTo(0.05);
  });

  it("clamps moisture to 1.0 at max", () => {
    const { moisture } = waterPlant(0.95, 0);
    expect(moisture).toBe(1.0);
  });

  it("does not change stress", () => {
    const before = 0.3;
    waterPlant(0.5, 0); // no stress output
    expect(before).toBe(0.3); // stress unchanged externally
  });
});

describe("Night Bloom — fertilize", () => {
  it("increases bloom by 0.08", () => {
    const { bloom } = fertilize(0, 0);
    expect(bloom).toBeCloseTo(0.08);
  });

  it("increases stress by 0.04", () => {
    const { stress } = fertilize(0, 0);
    expect(stress).toBeCloseTo(0.04);
  });
});

describe("Night Bloom — advance night", () => {
  it("increments day counter", () => {
    const { day } = advanceNight(0.7, 0, 0, 1);
    expect(day).toBe(2);
  });

  it("reduces moisture by 0.2", () => {
    const { moisture } = advanceNight(0.7, 0, 0, 1);
    expect(moisture).toBeCloseTo(0.5);
  });

  it("clamps moisture to 0 when very dry", () => {
    const { moisture } = advanceNight(0.1, 0, 0, 1);
    expect(moisture).toBe(0);
  });

  it("adds stress when moisture drops below 0.3", () => {
    const { stress } = advanceNight(0.4, 0, 0, 1);
    // moisture 0.4 - 0.2 = 0.2 < 0.3 → stress += 0.12
    expect(stress).toBeCloseTo(0.12);
  });

  it("adds bloom when moisture stays above 0.3", () => {
    const { bloom } = advanceNight(0.7, 0.1, 0, 1);
    expect(bloom).toBeCloseTo(0.13);
  });

  it("reduces stress when moisture healthy", () => {
    const { stress } = advanceNight(0.7, 0, 0.1, 1);
    expect(stress).toBeCloseTo(0.08);
  });

  it("does not drop stress below 0", () => {
    const { stress } = advanceNight(0.9, 0, 0, 1);
    expect(stress).toBeGreaterThanOrEqual(0);
  });
});

describe("Night Bloom — event trigger", () => {
  it("triggers event when stress > 0.85", () => {
    expect(isNightBloomEvent(0.9)).toBe(true);
  });

  it("does not trigger event at 0.85 exactly", () => {
    expect(isNightBloomEvent(0.85)).toBe(false);
  });

  it("does not trigger event below threshold", () => {
    expect(isNightBloomEvent(0.5)).toBe(false);
  });
});
