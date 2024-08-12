import React, { useState, useEffect } from 'react'
import { withRouter, useLocation, useHistory } from 'react-router-dom'
import { Button, message, Layout, Card, Row, Col, Menu, Steps } from 'antd'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import '../styles/generate-test.css'
import TestCodeEditor from '../pages/TestCodeEditor'
import LinkExpired from '../components/LinkExpired'
import WebCam from '../components/WebCam'
import { usePageVisibility } from '../Utils/Hooks/usePageVisibility'

const GenerateTest = () => {
  const history = useHistory()
  const search = useLocation()
  const [questions, setQuestions] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [showText, setShowText] = useState(true)
  const [language, setLanguage] = useState(null)
  const [showResult, setShowResult] = useState(
    'user_score_details' in localStorage ? true : false,
  )
  const [score, setScore] = useState(
    'user_score_details' in localStorage
      ? JSON.parse(localStorage.getItem('user_score_details'))['score'][
          'candidateScore'
        ]
      : {},
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const path = search.pathname.split('/')
  const [counter, setCounter] = useState(
    'user_details' in localStorage
      ? JSON.parse(localStorage.getItem('user_details'))['generated_question'][
          'duration'
        ]
      : 0,
  )
  const minutes = Math.floor(counter / 60)
  const seconds = Math.floor(counter % 60)
    .toString()
    .padStart(2, '0')
  const [isLinkExpired, setIsLinkExpired] = useState({})
  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  })
  const pageVisibilityStatus = usePageVisibility()
  const [items, setItems] = useState([])
  const [questionData, setQuestionData] = useState([])
  const [languages, setLanguages] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState()
  const [isSecondLastItem, setIsSecondLastItem] = useState(false)
  const [showPreviousButton, setShowPreviousButton] = useState(false)
  const [stepsItems, setStepsItems] = useState([])
  const [defaultMenuKey, setDefaultMenuKey] = useState()
  const [isTestFinished, setisTestFinished] = useState(false)
  const [current, setCurrent] = useState(1)

  // Use effect for handling the page switch
  useEffect(() => {
    const pageSwitchCount = parseInt(localStorage.getItem('screen_change')) || 0
    if (pageVisibilityStatus && !isCompleted && !isTestFinished) {
      localStorage.setItem('screen_change', pageSwitchCount + 1)
      if (pageSwitchCount >= 3) {
        alert(`Your exam link has expired due to switching browser tabs frequently.`)
        setIsCompleted(true)
        saveAnswer(question_details, '', 0, true)
      } else {
        alert(
          `Warning ${pageSwitchCount + 1}: You are not allowed to leave the page. Your progress may be lost.`,
        )
      }
    }
  }, [pageVisibilityStatus])

  // Test Score set at end
  useEffect(() => {
    setScore(
      'user_score_details' in localStorage
        ? JSON.parse(localStorage.getItem('user_score_details'))['score'][
            'candidateScore'
          ]
        : {},
    )
  }, [showResult])

  // Set Counter
  useEffect(() => {
    if (counter > 0) {
      const interval = setInterval(() => {
        setCounter(counter - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [counter])

  useEffect(() => {
    if (!isTestFinished) {
      const handleBeforeUnload = (event) => {
        event.preventDefault()
        return 'If You refresh it and the test will be automatically terminated.' // Optional message
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [])

  const openCodeEditor = () => {
    setShowCodeEditor(true)
    setShowText(false)
  }

  // Use effect for setting the questions details
  useEffect(() => {
    if ('user_details' in localStorage) {
      let data = JSON.parse(localStorage.getItem('user_details'))[
        'generated_question'
      ]

      // set timer for test
      setCounter(data['duration'])
      delete data['duration']
      setQuestions(data)
      setLanguage(Object.keys(data)[0])
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }

    if ('linkExpired' in localStorage) {
      let linkExpired = JSON.parse(localStorage.getItem('linkExpired'))
      setIsLinkExpired(linkExpired)
    }
  }, [''])

  // Menu Item setting
  useEffect(() => {
    if ('user_details' in localStorage) {
      let data = JSON.parse(localStorage.getItem('user_details'))[
        'generated_question'
      ]
      const languages = Array()
      for (let i in data) {
        if (Array.isArray(data[i])) {
          languages.push(i)
        }
      }
      const lang = languages && languages.length > 0 && languages[0]
      const question = data[lang]

      const defaultQuestion = question && question.length > 0 && question[0]

      setSelectedQuestion(defaultQuestion)
      setDefaultMenuKey(defaultQuestion.question + '')
      setLanguages(languages)
      console.log('useeffect', languages)

      let menuItemsData = []
      for (let i = 0; i < languages.length; i++) {
        let temp = {
          languageLabel: languages[i],
          languageKey: languages[i],
          languageQuestions: data[languages[i]],
        }
        menuItemsData.push(temp)
      }

      const items = menuItemsData.map((item) => {
        return getItemItem(
          item.languageLabel,
          item.languageKey,
          item.languageQuestions.map((ques, index) => {
            setQuestionData((current) => [
              ...current,
              { questionId: ques.question, questionDetails: ques },
            ])
            return getItemItem(
              ques.question_details.type == 1 ? 'MCQ' : 'Program',
              ques.question,
              null,
            )
          }),
        )
      })
      setItems(items)

      // setting steps items
      menuItemsData.map((item) => {
        item.languageQuestions.map((ques, index) => {
          setStepsItems((current) => [
            ...current,
            {
              key: ques.question,
              title: ques.question_details.type == 1 ? 'MCQ' : 'Program',
              description:
                ques.question_details.language.charAt(0).toUpperCase() +
                ques.question_details.language.slice(1),
              status: 'wait',
            },
          ])
        })
      })
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }

    if ('linkExpired' in localStorage) {
      let linkExpired = JSON.parse(localStorage.getItem('linkExpired'))
      setIsLinkExpired(linkExpired)
    }
  }, [])

  //
  function getItemItem(label, key, children) {
    return {
      key,
      children,
      label,
    }
  }

  // Menu Click Handling
  const onMenuClick = ({ item, key, keyPath, domEvent }) => {
    if ('user_details' in localStorage) {
      let questions = JSON.parse(localStorage.getItem('user_details'))[
        'generated_question'
      ]
      const lang = keyPath && keyPath.length > 0 && keyPath[keyPath.length - 1]
      const data = questions[lang]
      const selectedQues = data.filter((q) => q.question == key)

      setSelectedQuestion(selectedQues[0])
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }
  }

  const finishTest = (question_details) => {
    setisTestFinished(true)
    goToNextQuestion(question_details)
    localStorage.removeItem('user_details')
  }
  // Function to handle Next button Click
  const goToNextQuestion = (question_details) => {
    setCurrent(current + 1)
    console.log('next', current)
    console.log('default', defaultMenuKey)

    for (let i = 0; i < questionData.length; i++) {
      if (questionData[i].questionId == defaultMenuKey) {
        if ((i + 1) % questionData.length === 0) {
          saveAnswer(question_details, selectedAnswerIndex, result, true)
          setShowResult(true)
          setisTestFinished(true)
          localStorage.removeItem('user_details')
          return
        }

        if (i + 1 == questionData.length - 1) {
          setIsSecondLastItem(true)
        }

        // Show previous button
        if (i + 1 > 0) {
          setShowPreviousButton(true)
        }

        saveAnswer(question_details, selectedAnswerIndex, result, false)
        setSelectedAnswerIndex(null)
        setDefaultMenuKey('' + questionData[i + 1].questionId)
        setSelectedQuestion(questionData[i + 1].questionDetails)
      }
    }
  }

  // Function to handle Next button Click
  const goToPreviousQuestion = (question_details) => {
    setCurrent(current - 1)
    setIsSecondLastItem(false)
    for (let i = 0; i < questionData.length; i++) {
      if (questionData[i].questionId == defaultMenuKey) {
        if (i === 1) {
          setShowPreviousButton(false)
        }
        saveAnswer(question_details, selectedAnswerIndex, result, false)
        setSelectedAnswerIndex(null)
        setDefaultMenuKey('' + questionData[i - 1].questionId)
        setSelectedQuestion(questionData[i - 1].questionDetails)
      }
    }
  }

  // Function to handle once question selected
  const onAnswerSelected = (answer, selectedQuestionId) => {
    const updatedSteps = stepsItems.map((step) => {
      if (step.key == selectedQuestionId) {
        step.status = 'Finished'
      }
      return step
    })

    setStepsItems(updatedSteps)
    setSelectedAnswerIndex(answer)
    if (answer === correct_value) {
      setSelectedAnswer(true)
      setResult({
        score: result.score + 1,
        correctAnswers: result.correctAnswers + 1,
        wrongAnswers: 0,
      })
    } else {
      setSelectedAnswer(false)
      setResult({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: result.wrongAnswers + 1,
      })
    }
  }

  // Function to save answer
  const saveAnswer = (question_details, selectedAnswerIndex, score, finish) => {
    let candidateAnswers =
      selectedAnswerIndex !== undefined ? selectedAnswerIndex : candidate_answers
    question_details.question_score = 0
    let request_data = {
      userTestId: JSON.parse(localStorage.getItem('user_details'))['id'],
      question_details: question_details,
      candidate_answers: candidateAnswers,
      completed: finish ? true : false,
      score: score,
    }

    triggerFetchData(`save_candidate_answer/`, request_data)
      .then((data) => {
        if (data.data.completed) {
          let result = {
            score: data.data.score,
            correct_answers: data.data.correct_answers,
          }
          setScore(result)
          let candidateScore = {
            score: data.data.score,
            correct_answers: data.data.correct_answers,
          }
          localStorage.setItem(
            'user_score_details',
            JSON.stringify({ score: candidateScore, textFinished: true }),
          )
          setShowResult(true)
        }
      })
      .catch((reason) => message.error(reason))
  }

  const {
    option1,
    option2,
    option3,
    option4,
    correct_value,
    question_details,
    candidate_answers,
  } = selectedQuestion ? selectedQuestion : {}

  const onExit = () => {
    localStorage.clear()
    window.open('', '_self')
    window.close()
  }
  console.log('377', defaultMenuKey)

  return (
    <>
      <WebCam />
      <div className="quiz-container">
        {questions[language] && !showResult ? (
          <>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flex: 'row',
              }}
            >
              <div className="left-menu-bar">
                <Menu
                  defaultSelectedKeys={[defaultMenuKey]}
                  defaultOpenKeys={languages}
                  selectedKeys={defaultMenuKey}
                  mode="inline"
                  theme="light"
                  items={items}
                  onClick={onMenuClick}
                />
              </div>
              <div className="quiz-questions-box" style={{ width: '100%' }}>
                <div className="row">
                  {/* Time Left */}
                  <div className="col-4">
                    {counter > 0 ? (
                      <div className="timer">
                        <div className="clock">
                          <h1>Time Left - </h1>
                          <div className="numbers">
                            <p className="minutes">{minutes}</p>
                          </div>
                          <div className="colon">
                            <p>:</p>
                          </div>
                          <div className="numbers">
                            <p className="seconds">{seconds}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <LinkExpired modalName="timeExpire" />
                    )}
                  </div>
                </div>
                <hr></hr>
                <br></br>
                {/* Stepper */}
                {/* Question Name */}
                <div className="row question-row">
                  <div className="col">
                    <h2>{question_details.name}</h2>
                  </div>
                </div>
                {/* Question Details */}
                {/* <div className="container"> */}
                {/* MCQ Question Type */}
                {question_details.type == 1 ? (
                  <ul className="options-list">
                    {option1 && (
                      <li
                        onClick={() =>
                          onAnswerSelected(option1, question_details.id)
                        }
                        key={option1}
                        className={`option ${selectedAnswerIndex === option1 || candidate_answers === option1 ? 'selected-answer' : ''}`}
                      >
                        {option1}
                      </li>
                    )}
                    {option2 && (
                      <li
                        onClick={() =>
                          onAnswerSelected(option2, question_details.id)
                        }
                        key={option2}
                        className={`option ${selectedAnswerIndex === option2 || candidate_answers === option2 ? 'selected-answer' : ''}`}
                      >
                        {option2}
                      </li>
                    )}
                    {option3 && (
                      <li
                        onClick={() =>
                          onAnswerSelected(option3, question_details.id)
                        }
                        key={option3}
                        className={`option ${selectedAnswerIndex === option3 || candidate_answers === option3 ? 'selected-answer' : ''}`}
                      >
                        {option3}
                      </li>
                    )}
                    {option4 && (
                      <li
                        onClick={() =>
                          onAnswerSelected(option4, question_details.id)
                        }
                        key={option4}
                        className={`option ${selectedAnswerIndex === option4 || candidate_answers === option4 ? 'selected-answer' : ''}`}
                      >
                        {option4}
                      </li>
                    )}
                    {showPreviousButton && (
                      <button
                        className="navigation-button"
                        onClick={() => goToPreviousQuestion(question_details)}
                      >
                        Previous
                      </button>
                    )}
                    <button
                      className="navigation-button"
                      onClick={() => goToNextQuestion(question_details)}
                      style={{ marginLeft: showPreviousButton ? '8px' : '0px' }}
                    >
                      {isSecondLastItem ? 'Finish' : 'Next'}
                    </button>
                  </ul>
                ) : (
                  <div className="flex-center mt-4">
                    {showText && (
                      <button className="navigation-button" onClick={openCodeEditor}>
                        Click here to write code
                      </button>
                    )}
                    {showCodeEditor && (
                      <>
                        <TestCodeEditor />
                        {showPreviousButton && (
                          <button
                            className="navigation-button"
                            onClick={() => goToPreviousQuestion(question_details)}
                          >
                            Previous
                          </button>
                        )}
                        <button
                          className="navigation-button"
                          onClick={
                            isSecondLastItem
                              ? () => finishTest(question_details)
                              : () => goToNextQuestion(question_details)
                          }
                          style={{
                            marginLeft: showPreviousButton ? '8px' : '0px',
                          }}
                        >
                          {isSecondLastItem ? 'Finish' : 'Next'}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {/* </div> */}
              </div>
            </div>
          </>
        ) : score && !isCompleted && !isLinkExpired['expired'] ? (
          // Test Score section
          <Layout className="layout parent-container">
            <Card
              style={{
                width: '60%',
                padding: 2 + 'rem',
              }}
              className="card-style-test"
            >
              <h1 className="card-h1">Test finished</h1>
              <p className="card-p">
                You have successfully completed the test, you can close the browser.
                <p>Thank you.</p>
              </p>
              <p className="card-p"></p>
              {/* TODO: going to implement a section to display test analysis */}
              {/* <p className="card-p">Click to see complete analysis</p> */}
              {/* <Button className="card-button" onClick={onExit}>
                Exit Window
              </Button> */}
            </Card>
          </Layout>
        ) : isCompleted ? (
          <LinkExpired modalName="userComplete" />
        ) : isLinkExpired['expired'] ? (
          <LinkExpired modalName={isLinkExpired['module_name']} />
        ) : null}
      </div>
    </>
  )
}

export default withRouter(GenerateTest)
