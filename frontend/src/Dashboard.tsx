function Dashboard() {
  return <DashboardSummaryComponent />
}

function DashboardSummaryComponent() {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        {/* Title */}
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Good Morning, User</h1>
  
        {/* Subcomponents container */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          {/* Weekly Budget */}
          <div style={subComponentStyle}>
            <h2>Weekly Budget</h2>
            <p>Track your spending on meals this week.</p>
          </div>
  
          {/* Meals Planned */}
          <div style={subComponentStyle}>
            <h2>Meals Planned</h2>
            <p>See how many meals you’ve planned for the week.</p>
          </div>
  
          {/* Average Caloric Intake */}
          <div style={subComponentStyle}>
            <h2>Average Caloric Intake</h2>
            <p>Monitor your average daily calorie consumption.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Shared style for subcomponents
  const subComponentStyle: React.CSSProperties = {
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#333',
  };

export default Dashboard;