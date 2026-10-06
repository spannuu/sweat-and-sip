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

type PlannerFormData = {
  studio: string;
  location: string;
  startTime: string;
  duration: number;
  preferences: string[];
  maxWalkMinutes: number;
};

export default function PlanForm() {
  const [formData, setFormData] = useState<PlannerFormData>({
    studio: "",
    location: "",
    startTime: "",
    duration: 50,
    preferences: [],
    maxWalkMinutes: 15,
  });

  function updateField<K extends keyof PlannerFormData>(
    field: K,
    value: PlannerFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function togglePreference(preference: string) {
    setFormData((current) => {
      const isSelected = current.preferences.includes(preference);

      return {
        ...current,
        preferences: isSelected
          ? current.preferences.filter((item) => item !== preference)
          : [...current.preferences, preference],
      };
    });
  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error("Failed to create plan:", error);
  }
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

            <input
              type="text"
              placeholder="e.g. Solidcore"
              value={formData.studio}
              onChange={(event) =>
                updateField("studio", event.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Location</span>

            <input
              type="text"
              placeholder="e.g. Santana Row, San Jose"
              value={formData.location}
              onChange={(event) =>
                updateField("location", event.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Class start</span>

            <input
              type="time"
              value={formData.startTime}
              onChange={(event) =>
                updateField("startTime", event.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Duration</span>

            <select
              value={formData.duration}
              onChange={(event) =>
                updateField("duration", Number(event.target.value))
              }
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={50}>50 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={75}>75 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>
        </div>

        <div className={styles.preferenceGroup}>
          <span className={styles.groupLabel}>
            After class I want...
          </span>

          <div className={styles.chips}>
            {preferenceOptions.map((preference) => {
              const isSelected =
                formData.preferences.includes(preference);

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

          <select
            value={formData.maxWalkMinutes}
            onChange={(event) =>
              updateField("maxWalkMinutes", Number(event.target.value))
            }
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </label>

        <button className={styles.submitButton} type="submit">
          Find my post-workout spot
        </button>
      </form>
    </section>
  );
}