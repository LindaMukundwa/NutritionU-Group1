"use client"

// SearchBar.tsx - Reusable search bar component
import type { FC } from "react"
import styles from "./SearchBar.module.css"

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onFilterClick?: () => void
  onSubmit?: () => void
}

const SearchBar: FC<SearchBarProps> = ({ placeholder = "Search for Recipes", value, onChange, onFilterClick, onSubmit }) => {
  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchInputWrapper}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 14L11.1 11.1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit && onSubmit()
            }
          }}
        />
      </div>
      <div className={styles.rightControls}>
        <button className={styles.searchButton} onClick={() => onSubmit && onSubmit()} aria-label="Search">
          Search
        </button>

        {/* Filter Button - only show if onFilterClick is provided */}
        {onFilterClick && (
          <button className={styles.filterButton} onClick={onFilterClick} aria-label="Open filters">
            <svg
              className={styles.filterIcon}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H14L9.33333 7.66667V12L6.66667 13.3333V7.66667L2 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Filters</span>
          </button>
        )}
  </div>
    </div>
  )
}

export default SearchBar
