"use client"

import { type FC, useState } from "react"
import styles from "./Dashboard.module.css"

interface SummaryCardData {
  title: string;
  value: string | number;
  subtext: string;
  icon: string; 
  progressBar?: {
    current: number
    total: number
  }
}

interface DashboardProps {}

// --- Shell components for each content area ---
function MealContent() {
  return (
    <div>
      <h2 className={styles.greeting}>Meal Recommendations</h2>
      <p className={styles.prompt}>Content for meal recommendations will go here.</p>
    </div>
  )
}

function PlannerContent() {
  return (
    <div>
      <h2 className={styles.greeting}>Meal Planner</h2>
      <p className={styles.prompt}>Content for meal planning will go here.</p>
    </div>
  )
}

function NutritionContent() {
  return (
    <div>
      <h2 className={styles.greeting}>Nutrition Tracker</h2>
      <p className={styles.prompt}>Content for nutrition tracking will go here.</p>
    </div>
  )
}

function AIAssistantContent() {
  return (
    <div>
      <h2 className={styles.greeting}>AI Assistant</h2>
      <p className={styles.prompt}>Content for AI nutrition assistant will go here.</p>
    </div>
  )
}

// --- Dashboard Content Switcher ---
function DashboardContentSwitcher() {
  const [activeTab, setActiveTab] = useState("meals")

  const tabs = [
    { id: "meals", label: "Meals" },
    { id: "planner", label: "Planner" },
    { id: "nutrition", label: "Nutrition" },
    { id: "ai-assistant", label: "AI Assistant" },
  ]

  return (
    <div className={styles.contentSwitcher}>
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.active : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "meals" && <MealContent />}
        {activeTab === "planner" && <PlannerContent />}
        {activeTab === "nutrition" && <NutritionContent />}
        {activeTab === "ai-assistant" && <AIAssistantContent />}
      </div>
    </div>
  )
}

const Dashboard: FC<DashboardProps> = () => {
  const dashboardSummary: SummaryCardData[] = [
    {
      title: "Weekly Budget",
      value: "$65/100",
      subtext: "",
      icon: "$",
      progressBar: {
        current: 65,
        total: 100,
      },
    },
    {
      title: "Meals Planned",
      value: 12,
      subtext: "This week",
      icon: "🍴",
    },
    {
      title: "Avg. Calories",
      value: 1850,
      subtext: "",
      icon: "👨‍👧‍👦",
      progressBar: {
        current: 75,
        total: 100,
      },
    },
  ]

  // Helper function to render the progress bar
  const renderProgressBar = (current: number, total: number) => {
    const percentage = (current / total) * 100
    return (
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  const renderSummaryCard = (card: SummaryCardData) => (
    <div key={card.title} className={styles.summaryCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{card.title}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardValue}>{card.value}</div>
        <div className={styles.iconBackground}>{card.icon}</div>
      </div>

      {card.progressBar ? (
        renderProgressBar(card.progressBar.current, card.progressBar.total)
      ) : (
        <div className={styles.cardSubtext}>{card.subtext}</div>
      )}
    </div>
  )

  return (
    <div className={styles.Dashboard}>
      {/* Header/Greeting Section */}
      <div className={styles.header}>
        <h1 className={styles.greeting}>Good morning, Jessica! 👋</h1>
        <p className={styles.prompt}>
          Ready to plan some delicious meals for this week?
        </p>
      </div>

      {/* Summary Cards Section */}
      <div className={styles.summaryGrid}>
        {dashboardSummary.map(renderSummaryCard)}
      </div>

      {/* Dashboard Content Switcher Section */}
      <DashboardContentSwitcher />
    </div>
  )
}

export default Dashboard
