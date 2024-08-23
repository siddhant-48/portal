import React, { useState, useEffect } from 'react'
import { withRouter, useLocation, useHistory } from 'react-router-dom'
import {
  Button,
  message,
  Layout,
  Card,
  Row,
  Col,
  Menu,
  Steps,
  Modal,
  Typography,
  Divider,
} from 'antd'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import '../styles/generate-test.css'
import TestCodeEditor from '../pages/TestCodeEditor'
import LinkExpired from '../components/LinkExpired'
import WebCam from '../components/WebCam'
import { usePageVisibility } from '../Utils/Hooks/usePageVisibility'
import { findQuestionPosition } from '../Utils/utilFunctions'

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
    'remaining_duration' in localStorage
      ? localStorage.getItem('remaining_duration')
      : JSON.parse(localStorage.getItem('user_details'))['generated_question'][
          'duration'
        ],
  )
  const minutes = Math.floor(counter / 60)
  const seconds = Math.floor(counter % 60)
    .toString()
    .padStart(2, '0')
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
  const [defaultMenuKey, setDefaultMenuKey] = useState()
  const [isSecondLastItem, setIsSecondLastItem] = useState(false)
  const [showPreviousButton, setShowPreviousButton] = useState(false)
  const [stepsItems, setStepsItems] = useState([])
  const [isTestFinished, setisTestFinished] = useState(false)
  const [current, setCurrent] = useState(0)

  const [isLinkExpired, setIsLinkExpired] = useState({
    expired: false,
    module_name: '',
  })

  // Check if the exam is already completed on component mount
  useEffect(() => {
    const isExamCompleted = localStorage.getItem('is_exam_completed') === 'true'
    if (isExamCompleted) {
      setIsCompleted(true)
    }
  }, [])

  // Use effect for handling the page switch
  // useEffect(() => {
  //   const pageSwitchCount = parseInt(localStorage.getItem('screen_change')) || 0
  //   const isExamCompleted = localStorage.getItem('is_exam_completed') === 'true'

  //   // Update the state to reflect exam completion
  //   if (isExamCompleted) {
  //     setIsCompleted(true)
  //   } else if (pageVisibilityStatus && !isCompleted && !isTestFinished) {
  //     const newSwitchCount = pageSwitchCount + 1
  //     localStorage.setItem('screen_change', newSwitchCount)

  //     if (newSwitchCount >= 3) {
  //       alert('Your exam link has expired due to switching browser tabs frequently.')
  //       localStorage.setItem('is_exam_completed', 'true')
  //       setIsCompleted(true)
  //       saveAnswer(question_details, '', 0, true)
  //     } else {
  //       alert(
  //         `Warning ${newSwitchCount}: You are not allowed to leave the page. Your progress may be lost.`,
  //       )
  //     }
  //   }
  // }, [pageVisibilityStatus, isCompleted, isTestFinished])

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
        localStorage.setItem('remaining_duration', counter)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [counter])

  useEffect(() => {
    if (!isTestFinished) {
      const handleBeforeUnload = (event) => {
        // Prevent the default behavior
        event.preventDefault()
        event.returnValue = ''

        let userDetails = JSON.parse(localStorage.getItem('user_details')) || {}

        // Nullify candidate_answers in generated_question
        if (userDetails.generated_question) {
          Object.keys(userDetails.generated_question).forEach((language) => {
            const questions = userDetails.generated_question[language]

            // Ensure questions is an array before trying to iterate over it
            if (Array.isArray(questions)) {
              questions.forEach((question) => {
                if ('candidate_answers' in question) {
                  question.candidate_answers = null
                }
              })
            }
          })
        }

        // Delete the answers key directly
        if (userDetails.answers) {
          delete userDetails.answers
        }

        // Log the updated userDetails to confirm the changes
        console.log('Updated user_details:', userDetails)

        // Update the localStorage with the modified userDetails
        localStorage.setItem('user_details', JSON.stringify(userDetails))
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [isTestFinished])

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
      // setCounter(data['duration'])
      // delete data['duration']
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
      const languages = []
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

      // Setting steps items
      menuItemsData.map((item) => {
        item.languageQuestions.map((ques, index) => {
          setStepsItems((current) => [
            ...current,
            {
              key: ques.question,
              title: ques.question_details.type == 1 ? 'MCQ' : 'Program',
              description:
                ques.question_details?.language.charAt(0).toUpperCase() +
                ques.question_details?.language.slice(1),
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

      if (selectedQues.length > 0) {
        const selectedQuestion = selectedQues[0]
        setSelectedQuestion(selectedQuestion)
        setDefaultMenuKey(key)

        // Update current index based on selected question
        const index = questionData.findIndex(
          (q) => Number(q.questionId) === Number(key),
        )

        setCurrent(index)
        console.log('index', index)
        console.log(questionData.length)

        // Update button visibility
        setShowPreviousButton(index > 0)
        setIsSecondLastItem(index + 1 > questionData.length - 1)
      }
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }
  }

  const finishTest = (question_details) => {
    setisTestFinished(true)
    goToNextQuestion(question_details)
    localStorage.removeItem('user_details')
  }

  //get answer
  const getSelectedAnswerIndex = (questionId) => {
    let userDetails = JSON.parse(localStorage.getItem('user_details')) || {}
    let storedAnswers = userDetails.answers || {}

    return storedAnswers[questionId]
      ? storedAnswers[questionId].selectedAnswerIndex
      : null
  }

  //save answer
  const saveAnswerToLocalStorage = (
    questionId,
    selectedAnswerIndex,
    question_details,
  ) => {
    let userDetails = JSON.parse(localStorage.getItem('user_details')) || {}
    let storedAnswers = userDetails.answers || {}
    console.log('language', question_details?.language)

    // Update the candidate_answers in the generated_question
    let language = question_details?.language

    if (userDetails.generated_question && userDetails.generated_question[language]) {
      for (let question of userDetails.generated_question[language]) {
        if (question.question === question_details.id) {
          question.candidate_answers = selectedAnswerIndex
          break
        }
      }
    }

    // Update the answers object with the new selectedAnswerIndex
    storedAnswers[questionId] = { selectedAnswerIndex }

    userDetails.answers = storedAnswers

    localStorage.setItem('user_details', JSON.stringify(userDetails))
  }
  // Function to handle Next button Click
  const goToNextQuestion = (question_details) => {
    // Save the selected answer for the current question
    saveAnswerToLocalStorage(defaultMenuKey, selectedAnswerIndex, question_details)

    setCurrent(current + 1)
    for (let i = 0; i < questionData.length; i++) {
      if (questionData[i].questionId == defaultMenuKey) {
        // Check if this is the last question
        if ((i + 1) % questionData.length === 0) {
          showFinishModal(question_details)
          // handleFinishTest(question_details)
          return
        }

        if (i + 1 == questionData.length - 1) {
          setIsSecondLastItem(true)
        }

        // Show previous button
        if (i + 1 > 0) {
          setShowPreviousButton(true)
        }

        // Retrieve the selected answer for the next question
        const nextQuestionId = questionData[i + 1].questionId
        setSelectedAnswerIndex(getSelectedAnswerIndex(nextQuestionId))
        setDefaultMenuKey('' + nextQuestionId)
        setSelectedQuestion(questionData[i + 1].questionDetails)
      }
    }
  }

  const goToPreviousQuestion = (question_details) => {
    // Save the selected answer for the current question
    saveAnswerToLocalStorage(defaultMenuKey, selectedAnswerIndex, question_details)

    setCurrent(current - 1)
    setIsSecondLastItem(false)
    for (let i = 0; i < questionData.length; i++) {
      if (questionData[i].questionId == defaultMenuKey) {
        if (i === 1) {
          setShowPreviousButton(false)
        }

        // Retrieve the selected answer for the previous question
        const previousQuestionId = questionData[i - 1].questionId
        setSelectedAnswerIndex(getSelectedAnswerIndex(previousQuestionId))
        setDefaultMenuKey('' + previousQuestionId)
        setSelectedQuestion(questionData[i - 1].questionDetails)
      }
    }
  }

  // Function to handle once question selected
  const onAnswerSelected = (answer, selectedQuestionId) => {
    // Find the selected question details
    const selectedQuestion = stepsItems.find(
      (step) => step.key === selectedQuestionId,
    )

    // Ensure selectedQuestion exists and has the question_details property
    if (!selectedQuestion) {
      console.error('Selected question not found')
      return
    }

    const question_details = selectedQuestion.question_details

    // Update steps status
    const updatedSteps = stepsItems.map((step) => {
      if (step.key === selectedQuestionId) {
        step.status = 'Finished'
      }
      return step
    })

    setStepsItems(updatedSteps)

    // Update answer state
    setSelectedAnswerIndex(answer)

    // Check correctness and update result
    if (answer === correct_value) {
      setSelectedAnswer(true)
      setResult((prevResult) => ({
        ...prevResult,
        score: prevResult.score + 1,
        correctAnswers: prevResult.correctAnswers + 1,
        wrongAnswers: 0,
      }))
    } else {
      setSelectedAnswer(false)
      setResult((prevResult) => ({
        ...prevResult,
        wrongAnswers: prevResult.wrongAnswers + 1,
      }))
    }

    // Save the answer to localStorage
    saveAnswerToLocalStorage(selectedQuestionId, answer, question_details)
  }

  const saveAnswer = (question_details, user_question_answer_list, finish) => {
    //question type must be checked when program functionality is added
    question_details.question_score = 0
    let request_data = {
      userTestId: JSON.parse(localStorage.getItem('user_details'))['id'],
      q_type: 1,
      user_question_answer_list: user_question_answer_list,
      completed: finish ? true : false,
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

  //finish modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  //finish modal
  const showFinishModal = () => {
    let userDetails = JSON.parse(localStorage.getItem('user_details')) || {}
    let answeredCount = 0
    let unansweredCount = 0
    //get status
    Object.keys(userDetails.answers).forEach((questionId) => {
      const answerDetails = userDetails.answers[questionId]
      if (answerDetails && answerDetails.selectedAnswerIndex) {
        console.log(
          `Question ID ${questionId} is answered with: ${answerDetails.selectedAnswerIndex}`,
        )
      } else {
        console.log(`Question ID ${questionId} is unanswered or null.`)
      }
    })
    // Check the status of each MCQ
    Object.keys(userDetails.answers).forEach((questionId) => {
      const answerDetails = userDetails.answers[questionId]
      if (answerDetails && answerDetails.selectedAnswerIndex !== null) {
        answeredCount++
      } else {
        unansweredCount++
      }
    })

    const totalMCQs = Object.keys(userDetails.answers).length
    unansweredCount = totalMCQs - answeredCount // Calculate unanswered

    // Display the counts in the modal
    if (unansweredCount === 0) {
      setModalMessage(`All Answered questions: ${answeredCount}`)
    } else {
      setModalMessage(`Answered: ${answeredCount}, Unanswered: ${unansweredCount}`)
    }
    setIsModalOpen(true) // Trigger the modal open
  }

  const handleFinishCancel = () => {
    setIsModalOpen(false)
  }

  //final submission
  const handleOk = (question_details) => {
    let userDetails = JSON.parse(localStorage.getItem('user_details')) || {}
    console.log('final', userDetails.answers)

    // Check the status of each MCQ and log the results
    Object.keys(userDetails.answers).forEach((questionId) => {
      const answerDetails = userDetails.answers[questionId]
      if (answerDetails && answerDetails.selectedAnswerIndex) {
        console.log(
          `Question ID ${questionId} is answered with: ${answerDetails.selectedAnswerIndex}`,
        )
      } else {
        console.log(`Question ID ${questionId} is unanswered or null.`)
      }
    })

    // Extract user_question_answer_list data from userDetails
    let user_question_answer_list = Object.values(userDetails.generated_question)
      .filter((value) => Array.isArray(value))
      .flat()
      .map((item) => ({
        ...item.question_details,
        candidate_answers: item.candidate_answers,
        correct_value: item.correct_value,
      }))

    saveAnswer(question_details, user_question_answer_list, true)
    setShowResult(true)
    setisTestFinished(true)
    localStorage.removeItem('user_details')
    setIsModalOpen(false)
  }

  ////question tracker
  const [positionInfo, setPositionInfo] = useState({})

  useEffect(() => {
    console.log('useEffect triggered')
    if (items && Array.isArray(items)) {
      const questionId = +defaultMenuKey

      // Find the question position
      const result = findQuestionPosition(items, questionId)
      setPositionInfo(result)
    } else {
      console.warn('Items is not valid or empty')
    }
  }, [current, items])

  console.log('posi_info', positionInfo)

  return (
    <>
      <Modal
        title="Finish Test Confirmation"
        open={isModalOpen}
        onOk={() => handleOk(question_details)} // Pass question_details here
        onCancel={handleFinishCancel}
        okText="Finish"
        cancelText="Cancel"
        okButtonProps={{ type: 'primary', danger: true }}
        centered
      >
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={4}>Test Summary</Typography.Title>
          <Divider style={{ margin: '15px' }} />
          <Typography.Text style={{ fontSize: '16px' }}>
            {modalMessage}
          </Typography.Text>
          <Divider dashed style={{ margin: '15px' }} />
          <Typography.Text strong style={{ fontSize: '18px', color: '#fa541c' }}>
            Are you sure you want to Finish the Test?
          </Typography.Text>
        </div>
      </Modal>

      <WebCam />
      <div className="quiz-container">
        {isCompleted ? (
          <LinkExpired modalName="userComplete" />
        ) : questions[language] && !showResult ? (
          <>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div className="left-menu-bar">
                <Menu
                  defaultSelectedKeys={[defaultMenuKey]}
                  defaultOpenKeys={languages}
                  selectedKeys={defaultMenuKey}
                  mode="inline"
                  theme="dark"
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
                          <h1> Time Left - </h1>
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
                  <div className="question-tracker">
                    {positionInfo && <span>{positionInfo}</span>}
                  </div>
                </div>
                <hr></hr>
                <br></br>
                {/* Stepper */}
                {/* Question Name */}
                <div className="question-container">{question_details.name}</div>
                {/* Question Details */}
                {/* <div className="container"> */}
                {/* MCQ Question Type */}
                {question_details.type == 1 ? (
                  <>
                    <div className="options-container">
                      <Row justify={'space-between'} gutter={16}>
                        <Col span={12}>
                          {option1 && (
                            <div
                              onClick={() =>
                                onAnswerSelected(option1, question_details.id)
                              }
                              key={option1}
                              className={`option option-a ${selectedAnswerIndex === option1 || candidate_answers === option1 ? 'selected-answer selected' : ''}`}
                            >
                              {option1}
                            </div>
                          )}
                        </Col>
                        <Col span={12}>
                          {option2 && (
                            <div
                              onClick={() =>
                                onAnswerSelected(option2, question_details.id)
                              }
                              key={option2}
                              className={`option option-b ${selectedAnswerIndex === option2 || candidate_answers === option2 ? 'selected-answer selected' : ''}`}
                            >
                              {option2}
                            </div>
                          )}
                        </Col>
                      </Row>
                      <Row justify={'space-between'} gutter={16}>
                        <Col span={12}>
                          {option3 && (
                            <div
                              onClick={() =>
                                onAnswerSelected(option3, question_details.id)
                              }
                              key={option3}
                              className={`option option-c ${selectedAnswerIndex === option3 || candidate_answers === option3 ? 'selected-answer selected' : ''}`}
                            >
                              {option3}
                            </div>
                          )}
                        </Col>
                        <Col span={12}>
                          {option4 && (
                            <div
                              onClick={() =>
                                onAnswerSelected(option4, question_details.id)
                              }
                              key={option4}
                              className={`option option-d ${selectedAnswerIndex === option4 || candidate_answers === option4 ? 'selected-answer selected' : ''}`}
                            >
                              {option4}
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                    <Row justify={'space-between'}>
                      <Col span={6}>
                        {showPreviousButton && (
                          <button
                            className="navigation-button"
                            onClick={() => goToPreviousQuestion(question_details)}
                          >
                            Previous
                          </button>
                        )}
                      </Col>
                      <Col span={6}>
                        <button
                          className="navigation-button"
                          onClick={() => goToNextQuestion(question_details)}
                        >
                          {isSecondLastItem ? 'Finish' : 'Next'}
                        </button>
                      </Col>
                    </Row>
                  </>
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
