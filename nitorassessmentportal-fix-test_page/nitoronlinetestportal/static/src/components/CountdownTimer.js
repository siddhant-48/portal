import React, { useState, useEffect } from 'react'

import LinkExpired from './LinkExpired'
import '../styles/generate-test.css'

const CountdownTimer = ({ testDuration, onTimeExpire }) => {
  const [timeLeft, setTimeLeft] = useState(testDuration)
  const [isExpired, setIsExpired] = useState(false) // Track if time has expired

  useEffect(() => {
    const endTime = localStorage.getItem('endTime')
    if (endTime) {
      const remainingTime = Math.max(
        0,
        Math.floor((new Date(endTime) - new Date()) / 1000),
      )
      setTimeLeft(remainingTime)
    } else {
      const newEndTime = new Date(new Date().getTime() + testDuration * 1000)
      localStorage.setItem('endTime', newEndTime)
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval)
          localStorage.removeItem('endTime')
          onTimeExpire() // Call the function when time expires
          setIsExpired(true) // Mark the timer as expired
          return 0 // Ensure timeLeft doesn't go below 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [testDuration, onTimeExpire])

  // Render LinkExpired if the time has expired
  if (isExpired || timeLeft <= 0) {
    return <LinkExpired modalName="timeExpire" />
  }

  return (
    <div className="timer">
      <div className="clock">
        <h1> Time Left - </h1>
        <div className="numbers">
          <p className="minutes">{Math.floor(timeLeft / 60)}</p>
        </div>
        <div className="colon">
          <p>:</p>
        </div>
        <div className="numbers">
          <p className="seconds">
            {String(Math.floor(timeLeft % 60)).padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CountdownTimer
