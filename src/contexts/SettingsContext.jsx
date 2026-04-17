import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

const defaultSettings = {
  notifications: true,
  timer: false,
  sound: true,
  dark_mode: false,
}

export function SettingsProvider({ children }) {
  // Try to load from localStorage if available, otherwise fallback to defaults
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('mathquest_settings')
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  // Watch for changes and save to local storage
  useEffect(() => {
    localStorage.setItem('mathquest_settings', JSON.stringify(settings))
    
    // Apply dark mode system-wide
    if (settings.dark_mode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Common UI Sounds (using data URIs to avoid uploading assets)
  const playSound = (type) => {
    if (!settings.sound) return
    
    let audioSrc = ''
    if (type === 'success') {
      audioSrc = 'data:audio/mp3;base64,//OExAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAOAAADeQAERkYEBwoMDhESFBUXGBocHiAhJCUnKiswMjU3Oz0/QkRHSUtNUFJWV1laXF5hYmRlZ2lsb3F0dnd6fX+Cg4WHio2PkpSWmJqdnp+goaOlpqeora+xuby+wcLEx8nLzc/Q0tXX2dvd4OLk5ufo6err7e/x8/X3+fv9/v8AAAD5U0xBTUUzLjEwMKgAAAAAAAAAABRgJBUlZQQAMwAAeSUDedZCAAAAAAAAAAAAAAAAAAAA//OExAAA0gH2mEAQAASIEoMIAgAAdnBwQAAAACEQAAAgCFAAAAAAAAAAABEAAAMABwAAAHAAAewAEREREQyIiMRERERDIiIxEREREMiIjEREREQyIiMRERERDIiIxEREREMiIjEREREQyIiMAAD//+gAD///oAA///6AAP//+gAD///oAA///6AAP//+gAAO6w1lQ1lQ1lQ1lQ1lQ1lQv/OExAYAAAAN8AAAAAAABvEAAAAAAW2P7f2/t/b+39v7f2/t/b+325t/Z+f+x/b/x9r8z/+n+N/7X+//b+39T/H//7//5u6yB48X///x4////x4////x4////x4oAABQAAHgAAAAQAAN4AAHgAAAAMeAAB4AAAAA40AAB4AAAAGHAAAeAAAAAsUAAA8AAAAO9gAAGwAAAENaAAAXAAA='
    } else if (type === 'error') {
      audioSrc = 'data:audio/mp3;base64,//OExAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAMAAACdQAERkYEBwsNDxETFRcZHB4gIiQoKiwuMDI0Njk7PT9BRENFSUxOUFFTVVhaXF5gY2RlZ2lrbW9xdHV3eXp8f4CChYaIiYqNkJKUl5mbnZ+hpKamqqusrrCys7W2t7m6vL2/wcLExsfKy83P0NLT1dXX2drc3d7f4OLk5ufo6evs7e/v8fL09ff5+vv9/wAAAD5U0xBTUUzLjEwMKgAAAAAAAAAABRgJBUlZQQAMwAAfxgCanL3AAAAAAAAAAAAAAAAAAAA//OExAAAxoJ3HUAQAAfIFnuIAgAAA6MAAAAAAkMAAAAAMAAAAAAAAAAABEAAAMABwAAAHAAAewAEREREQyIiMRERERDIiIxEREREMiIjEREREQyIiMRERERDIiIxEREREMiIjEREREQyIiMAAD//+gAD///oAA///6AAP//+gAD///oAA///6AAP//+gAAIuM8vLxv/OExAYAAAAN8gAAAAAAABwAAAAAAW2P7f2/t/b+3x/b+39v7f2/fxfp/Z+f+x/b/x9r8z/+n+N/7X+//b+39T/H//7//9o0AABQAAHgAAAAQAAN4AAHgAAAAMfAAB4AAAAA48AAB4AAAAGJAAAeAAAAAsbAAA8AAAAO9gAAGwAAAENnAAAXAAA='
    }

    if (audioSrc) {
      const audio = new Audio(audioSrc)
      audio.volume = 0.5
      audio.play().catch(e => console.log('Audio autoplay prevented'))
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting, playSound }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
