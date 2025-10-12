//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import LandingPage from './components/LandingPage/LandingPage'
import Dashboard from './components/Dashboard/Dashboard'
import OnboardingPage from './components/OnboardingPage/OnboardingPage'

function App() {
  //const [count, setCount] = useState(0)

  return (
    <div className="App">
      <OnboardingPage />
    </div>
  );
}

export default App;
