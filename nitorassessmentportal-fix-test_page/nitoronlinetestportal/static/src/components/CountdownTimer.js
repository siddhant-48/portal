import React, { useState, useEffect } from 'react'

import LinkExpired from './LinkExpired'
import '../styles/generate-test.css'

const CountdownTimer = ({ testDuration }) => {
  const [timeLeft, setTimeLeft] = useState(testDuration)

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
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [testDuration])

  return timeLeft > 0 ? (
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
  ) : (
    <LinkExpired modalName="timeExpire" />
  )
}

export default CountdownTimer
