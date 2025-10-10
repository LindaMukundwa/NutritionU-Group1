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
  const [showFilters, setShowFilters] = React.useState(false)
  const [selectedFilters, setSelectedFilters] = React.useState({
    category: "All",
    maxTime: "Any",
    maxPrice: "Any",
    dietary: [] as string[],
  })

  const sampleMeals = [
    {
      imageUrl: undefined,
      title: "Mediterranean Chickpea Bowl",
      description: "A nutritious bowl packed with chickpeas, fresh vegetables, and tahini dressing",
      time: 25,
      price: 4.5,
      calories: 420,
      rating: 4.5,
      tags: ["High Protein", "Budget-Friendly", "Vegetarian"],
      category: "Lunch",
    },
    {
      imageUrl: undefined,
      title: "Avocado Toast with Eggs",
      description: "Crispy whole grain bread topped with mashed avocado and sunny-side-up eggs",
      time: 15,
      price: 3.2,
      calories: 350,
      rating: 4.2,
      tags: ["Quick", "High Fiber", "Vegetarian"],
      category: "Breakfast",
    },
    {
      imageUrl: undefined,
      title: "Teriyaki Chicken Bowl",
      description: "Grilled chicken with teriyaki sauce served over rice with steamed vegetables",
      time: 30,
      price: 5.8,
      calories: 520,
      rating: 4.7,
      tags: ["High Protein"],
      category: "Dinner",
    },
    {
      imageUrl: undefined,
      title: "Greek Yogurt Parfait",
      description: "Creamy yogurt layered with granola, fresh berries, and honey",
      time: 10,
      price: 2.8,
      calories: 280,
      rating: 4.6,
      tags: ["Quick", "High Protein", "Vegetarian"],
      category: "Breakfast",
    },
    {
      imageUrl: undefined,
      title: "Veggie Wrap",
      description: "Whole wheat wrap filled with hummus, fresh vegetables, and feta cheese",
      time: 12,
      price: 3.5,
      calories: 320,
      rating: 4.3,
      tags: ["Quick", "Vegetarian", "Budget-Friendly"],
      category: "Lunch",
    },
    {
      imageUrl: undefined,
      title: "Trail Mix Energy Bites",
      description: "No-bake energy balls with oats, peanut butter, and dark chocolate chips",
      time: 5,
      price: 1.5,
      calories: 180,
      rating: 4.8,
      tags: ["Quick", "Budget-Friendly"],
      category: "Snacks",
    },
  ]

  const filteredMeals = sampleMeals.filter((meal) => {
    const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedFilters.category === "All" || meal.category === selectedFilters.category
    const matchesTime = selectedFilters.maxTime === "Any" || meal.time <= Number.parseInt(selectedFilters.maxTime)
    const matchesPrice = selectedFilters.maxPrice === "Any" || meal.price <= Number.parseFloat(selectedFilters.maxPrice)
    const matchesDietary =
      selectedFilters.dietary.length === 0 || selectedFilters.dietary.every((diet) => meal.tags.includes(diet))

    return matchesSearch && matchesCategory && matchesTime && matchesPrice && matchesDietary
  })

  const handleFilterClick = () => {
    setShowFilters(!showFilters)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedFilters({ ...selectedFilters, category })
  }

  const handleTimeChange = (maxTime: string) => {
    setSelectedFilters({ ...selectedFilters, maxTime })
  }

  const handlePriceChange = (maxPrice: string) => {
    setSelectedFilters({ ...selectedFilters, maxPrice })
  }

  const handleDietaryToggle = (dietary: string) => {
    const newDietary = selectedFilters.dietary.includes(dietary)
      ? selectedFilters.dietary.filter((d) => d !== dietary)
      : [...selectedFilters.dietary, dietary]
    setSelectedFilters({ ...selectedFilters, dietary: newDietary })
  }

  const handleClearFilters = () => {
    setSelectedFilters({
      category: "All",
      maxTime: "Any",
      maxPrice: "Any",
      dietary: [],
    })
  }

  return (
    <div>
      <h2 className={styles.greeting}>Meal Recommendations</h2>
      <p className={styles.prompt}>Discover delicious recipes tailored to your preferences.</p>

      <div className={styles.searchBarContainer}>
        <SearchBar
          placeholder="Search for Recipes"
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={handleFilterClick}
        />

        {showFilters && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filter Meals</h3>
              <button onClick={handleClearFilters} className={styles.clearButton}>
                Clear All
              </button>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Meal Type</label>
              <div className={styles.filterOptions}>
                {["All", "Breakfast", "Lunch", "Dinner", "Snacks"].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`${styles.filterOption} ${selectedFilters.category === category ? styles.filterOptionActive : ""}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Max Cooking Time</label>
              <div className={styles.filterOptions}>
                {["Any", "15", "30", "45"].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeChange(time)}
                    className={`${styles.filterOption} ${selectedFilters.maxTime === time ? styles.filterOptionActive : ""}`}
                  >
                    {time === "Any" ? "Any" : `${time} min`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Max Price</label>
              <div className={styles.filterOptions}>
                {["Any", "3", "5", "7"].map((price) => (
                  <button
                    key={price}
                    onClick={() => handlePriceChange(price)}
                    className={`${styles.filterOption} ${selectedFilters.maxPrice === price ? styles.filterOptionActive : ""}`}
                  >
                    {price === "Any" ? "Any" : `$${price}`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Dietary Preferences</label>
              <div className={styles.filterCheckboxes}>
                {["Vegetarian", "High Protein", "Quick", "Budget-Friendly"].map((dietary) => (
                  <label key={dietary} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.dietary.includes(dietary)}
                      onChange={() => handleDietaryToggle(dietary)}
                      className={styles.checkbox}
                    />
                    <span>{dietary}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.mealScrollContainer}>
        {filteredMeals.map((meal, index) => (
          <MealContentCard
            key={index}
            imageUrl={meal.imageUrl}
            title={meal.title}
            description={meal.description}
            time={`${meal.time} min`}
            price={`$${meal.price.toFixed(2)}`}
            calories={meal.calories}
            rating={meal.rating}
            tags={meal.tags}
          />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          <p>No meals found matching your criteria</p>
          <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>Try adjusting your search or filters</p>
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
