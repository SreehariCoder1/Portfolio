import styles from './AboutMe.module.css';

const AboutMe = ({ isVisible }) => {
    return (
        <div className={`${styles.aboutMeContainer} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.contentGrid}>
                {/* Image Section */}
                <div className={`${styles.card} ${styles.imageCard}`}>
                    <div className={styles.imageContainer}>
                        <img src="/images/sreehari-dileep.webp" alt="Sreehari Dileep" className={styles.profileImage} />
                    </div>
                </div>

                {/* Description */}
                <div className={`${styles.card} ${styles.descriptionCard}`}>
                    <h2 className={styles.sectionTitle}>About Me</h2>
                    <p className={styles.descriptionText}>
                        Hi, I'm Sreehari Dileep, a passionate Software Developer who loves creating meaningful products that make an impact. I enjoy working across the full stack, learning new technologies, and continuously improving my craft.
                    </p>
                </div>

                {/* Education */}
                <div className={`${styles.card} ${styles.educationCard}`}>
                    <h2 className={styles.sectionTitle}>Education</h2>
                    <div className={styles.timeline}>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <h3 className={styles.timelineTitle}>AI-Powered MERN(Internship)</h3>
                            <p className={styles.timelineSubtitle}>Upcode Software Labs, Kannur • June 2025 - March 2026</p>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <h3 className={styles.timelineTitle}>Diploma in Electronics Engineering</h3>
                            <p className={styles.timelineSubtitle}>Government Polytechnic College, Mattannur  • 2021 - 2024</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Animation */}
            <div className={styles.animationCard}>
                <div className={styles.box}>
                    {Array.from({ length: 16 }).map((_, idx) => (
                        <span key={idx} style={{ '--i': idx + 1 }}>
                            <i>CODE</i>BUILD<i>REPEAT</i>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutMe;
