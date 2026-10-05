"use client";

import { useState } from "react";
import styles from "./PlanForm.module.css";

const preferenceOptions = [
  "Coffee",
  "Matcha",
  "Smoothie",
  "Juice",
  "Bakery",
  "Brunch",
];

export default function PlanForm() {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  function togglePreference(preference: string) {
    setSelectedPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className={styles.section} id="planner">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Plan your outing</p>
        <h2>Tell us where class ends.</h2>
        <p>
          We&apos;ll use your class timing and preferences to find the best
          nearby post-workout spot.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Studio</span>
            <input type="text" placeholder="e.g. Solidcore" />
          </label>

          <label className={styles.field}>
            <span>Location</span>
            <input type="text" placeholder="e.g. Santana Row, San Jose" />
          </label>

          <label className={styles.field}>
            <span>Class start</span>
            <input type="time" />
          </label>

          <label className={styles.field}>
            <span>Duration</span>
            <select defaultValue="50">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="50">50 minutes</option>
              <option value="60">60 minutes</option>
              <option value="75">75 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </label>
        </div>

        <div className={styles.preferenceGroup}>
          <span className={styles.groupLabel}>After class I want...</span>

          <div className={styles.chips}>
            {preferenceOptions.map((preference) => {
              const isSelected = selectedPreferences.includes(preference);

              return (
                <button
                  key={preference}
                  type="button"
                  className={`${styles.chip} ${
                    isSelected ? styles.selected : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => togglePreference(preference)}
                >
                  {preference}
                </button>
              );
            })}
          </div>
        </div>

        <label className={styles.walkField}>
          <span>Maximum walking time</span>
          <select defaultValue="15">
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </label>

        <button className={styles.submitButton} type="submit">
          Find my post-workout spot
        </button>
      </form>
    </section>
  );
}