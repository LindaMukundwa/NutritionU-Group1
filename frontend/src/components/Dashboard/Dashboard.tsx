import { type FC } from 'react';
import styles from './Dashboard.module.css';

// Define the shape for the summary data for clarity and type safety
interface SummaryCardData {
  title: string;
  value: string | number;
  subtext: string;
  icon: string; // Using a string to represent a placeholder or actual icon element
  progressBar?: {
    current: number;
    total: number;
  };
}

interface DashboardProps {}

const Dashboard: FC<DashboardProps> = () => {
  const dashboardSummary: SummaryCardData[] = [
    {
      title: 'Weekly Budget',
      value: '$65/100',
      subtext: '', 
      icon: '$', 
      progressBar: {
        current: 65,
        total: 100,
      },
    },
    {
      title: 'Meals Planned',
      value: 12,
      subtext: 'This week',
      icon: '🍴', 
    },
    {
      title: 'Avg. Calories',
      value: 1850,
      subtext: '',
      icon: '👨‍👧‍👦', 
      progressBar: {
        current: 75, 
        total: 100,
      },
    },
  ];

  // Helper function to render the progress bar
  const renderProgressBar = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    return (
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderSummaryCard = (card: SummaryCardData) => (
    <div key={card.title} className={styles.summaryCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{card.title}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardValue}>
          {card.value}
        </div>
        <div className={styles.iconBackground}>
          {}
          {card.icon}
        </div>
      </div>
      
      {card.progressBar ? (
        renderProgressBar(card.progressBar.current, card.progressBar.total)
      ) : (
        <div className={styles.cardSubtext}>{card.subtext}</div>
      )}
    </div>
  );

  return (
    <div className={styles.Dashboard}>
      {/* Header/Greeting Section */}
      <div className={styles.header}>
        <h1 className={styles.greeting}>Good morning, Jessica! 👋</h1>
        <p className={styles.prompt}>Ready to plan some delicious meals for this week?</p>
      </div>
      
      {/* Summary Cards Section */}
      <div className={styles.summaryGrid}>
        {dashboardSummary.map(renderSummaryCard)}
      </div>
    </div>
  );
};

export default Dashboard;