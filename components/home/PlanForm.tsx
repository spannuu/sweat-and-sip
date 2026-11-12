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

type PlaceResult = {
  placeId: string;
  name: string;
  address: string;
  categories: string[];
  distanceMeters: number | null;
  latitude?: number;
  longitude?: number;
  preferenceScore: number;
  distanceScore: number;
  walkingMinutes: number | null;
  totalScore: number;
  recommendationReason: string;
};

type PlanResponse = {
  plan: {
    studio: string;
    location: {
      formattedAddress: string;
      latitude: number;
      longitude: number;
    };
    startTime: string;
    duration: number;
    preferences: string[];
    maxWalkMinutes: number;
    classEndTime: string;
  };
  places: PlaceResult[];
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
  const [results, setResults] = useState<PlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingPlaceId, setSavingPlaceId] = useState<string | null>(null);
  const [savedPlaceId, setSavedPlaceId] = useState<string | null>(null);

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
    }
  );
  }

  function getStartsAtIso(startTime: string) {
  const [hours, minutes] = startTime.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create plan");
      }

      setResults(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveOuting(place: PlaceResult) {
  if (!results) return;

  setSavingPlaceId(place.placeId);

  try {
    const response = await fetch("/api/outings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studio: formData.studio,
        locationName: results.plan.location.formattedAddress,
        startsAt: getStartsAtIso(formData.startTime),
        durationMinutes: formData.duration,
        preferences: formData.preferences,
        maxWalkMinutes: formData.maxWalkMinutes,

        venue: {
          placeId: place.placeId,
          name: place.name,
          address: place.address,
          walkingMinutes: place.walkingMinutes,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to save outing");
    }

    setSavedPlaceId(place.placeId);
  } catch (error) {
    console.error(error);
  } finally {
    setSavingPlaceId(null);
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

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Finding your spots..."
            : "Find my post-workout spot"}
        </button>
          {error && <p>{error}</p>}

          {results && (
  <div className={styles.results}>
    <div className={styles.resultsHeader}>
      <p className={styles.resultsEyebrow}>Your post-class picks</p>
      <h3>Where to go after {results.plan.studio}</h3>
      <p>
        Class ends at {results.plan.classEndTime}. Here are the best matches
        nearby.
      </p>
    </div>

    <div className={styles.resultCards}>
      {results.places.slice(0, 3).map((place, index) => {
        const walkingMinutes = place.walkingMinutes;

        return (
          <article className={styles.resultCard} key={place.placeId}>
            <div className={styles.resultRank}>
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className={styles.resultContent}>
              <div className={styles.resultTop}>
                <h4>{place.name}</h4>

                {walkingMinutes !== null && (
                  <span>{walkingMinutes} min walk</span>
                )}
              </div>

              <p className={styles.reason}>
                {place.recommendationReason}
              </p>

              <p className={styles.address}>{place.address}</p>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => handleSaveOuting(place)}
                disabled={
                  savingPlaceId === place.placeId ||
                  savedPlaceId === place.placeId
                }
              >
                {savingPlaceId === place.placeId
                  ? "Saving..."
                  : savedPlaceId === place.placeId
                    ? "Saved ✓"
                    : "Save this outing"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  </div>
)}
      </form>
    </section>
  );
}