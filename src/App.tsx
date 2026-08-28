import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app">
      <section className='welcome-card'>
        <span className='game-title'>Questwood</span>
        <h1>Your adventure begins here</h1>
        <p>Complete small quests, earn rewards and help your little world to grow</p>
        <button type='button'>
          Begin today's quests.
        </button>
      </section>
    </main>
  )
}

export default App
