"use client"

// SearchBar.tsx - Reusable search bar component
import type { FC } from "react"
import styles from "./SearchBar.module.css"

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onFilterClick?: () => void
}

const SearchBar: FC<SearchBarProps> = ({ placeholder = "Search for Recipes", value, onChange, onFilterClick }) => {
  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchInputWrapper}>
        {/* Search Icon */}
        <span className={styles.searchIcon}>🔍</span>

        {/* Search Input */}
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* Filter Button */}
      <button className={styles.filterButton} onClick={onFilterClick} aria-label="Open filters">
        <span className={styles.filterIcon}>⚙️</span>
        <span>Filters</span>
      </button>
    </div>
  )
}

export default SearchBar
