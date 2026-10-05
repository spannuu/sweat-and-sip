import styles from "./page.module.css";
import PlanForm from "@/components/home/PlanForm";
export default function Home() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <span className={styles.logo}>Sweat & Sip</span>

        <span className={styles.navLabel}>Post-workout plans, simplified.</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Your post-workout plans, handled.</p>

          <h1>Where are we going after class?</h1>

          <p className={styles.description}>
            Find the best coffee, matcha, smoothie, and brunch spots near your
            workout studio — based on when class ends and how far you want to
            walk.
          </p>

          <button className={styles.primaryButton}>Plan my outing</button>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewLabel}>Your morning</div>

          <div className={styles.planItem}>
            <span className={styles.time}>10:00 AM</span>
            <div>
              <strong>Reformer Pilates</strong>
              <p>50 min</p>
            </div>
          </div>

          <div className={styles.walk}>
            <span>↓</span>
            <p>8 min walk</p>
          </div>

          <div className={styles.planItem}>
            <span className={styles.time}>11:00 AM</span>
            <div>
              <strong>Matcha + brunch</strong>
              <p>Nearby recommendation</p>
            </div>
          </div>
        </div>
      </section>
      <PlanForm />
    </main>
  );
}