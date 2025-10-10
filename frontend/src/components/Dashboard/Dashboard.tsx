"use client"

import React, { type FC, useState } from "react"
import styles from "./Dashboard.module.css"
import MealContentCard from "./MealContentCard/MealContentCard"
import SearchBar from "./SearchBar/SearchBar"

interface SummaryCardData {
  title: string
  value: string | number
  subtext: string
  icon: string
  progressBar?: {
    current: number
    total: number
  }
}

type DashboardProps = {}

// --- Shell components for each content area ---
function MealContent() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const sampleMeals = [
    {
      imageUrl: undefined,
      title: "Mediterranean Chickpea Bowl",
      description: "A nutritious bowl packed with chickpeas, fresh vegetables, and tahini dressing",
      time: "25 min",
      price: "$4.50",
      calories: 420,
      rating: 4.5,
      tags: ["High Protein", "Budget-Friendly", "Vegetarian"],
    },
    {
      imageUrl: undefined,
      title: "Avocado Toast with Eggs",
      description: "Crispy whole grain bread topped with mashed avocado and sunny-side-up eggs",
      time: "15 min",
      price: "$3.20",
      calories: 350,
      rating: 4.2,
      tags: ["Quick", "High Fiber", "Vegetarian"],
    },
    {
      imageUrl: undefined,
      title: "Teriyaki Chicken Bowl",
      description: "Grilled chicken with teriyaki sauce served over rice with steamed vegetables",
      time: "30 min",
      price: "$5.80",
      calories: 520,
      rating: 4.7,
      tags: ["High Protein"],
    },
  ]

  const filteredMeals = sampleMeals.filter((meal) => meal.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleFilterClick = () => {
    console.log("Filter button clicked")
    // You can add filter modal/dropdown logic here later
  }

  return (
    <div>
      <h2 className={styles.greeting}>Meal Recommendations</h2>
      <p className={styles.prompt}>Discover delicious recipes tailored to your preferences.</p>

      <SearchBar
        placeholder="Search for Recipes"
        value={searchQuery}
        onChange={setSearchQuery}
        onFilterClick={handleFilterClick}
      />

      {/* Horizontal Scroll Container */}
      <div className={styles.mealScrollContainer}>
        {filteredMeals.map((meal, index) => (
          <MealContentCard
            key={index}
            imageUrl={meal.imageUrl}
            title={meal.title}
            description={meal.description}
            time={meal.time}
            price={meal.price}
            calories={meal.calories}
            rating={meal.rating}
            tags={meal.tags}
          />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          <p>No meals found matching "{searchQuery}"</p>
          <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>Try adjusting your search terms</p>
        </div>
      )}
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
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ""}`}
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
        <div className={styles.progressBarFill} style={{ width: `${percentage}%` }} />
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
        <p className={styles.prompt}>Ready to plan some delicious meals for this week?</p>
      </div>

      {/* Summary Cards Section */}
      <div className={styles.summaryGrid}>{dashboardSummary.map(renderSummaryCard)}</div>

      {/* Dashboard Content Switcher Section */}
      <DashboardContentSwitcher />
    </div>
  )
}

export default Dashboard
