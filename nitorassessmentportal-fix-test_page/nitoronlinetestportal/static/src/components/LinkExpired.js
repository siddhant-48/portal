import React from 'react'
import { Modal, Button } from 'antd'
import '../styles/link_expire.css' // Optional: for additional styling

const goBack = () => {
  // Clear relevant localStorage data and close the window
  localStorage.removeItem('user_details')
  localStorage.removeItem('user_score_details')
  localStorage.removeItem('screen_change')
  localStorage.removeItem('linkExpired')
  localStorage.removeItem('is_exam_completed')

  // Close the current tab/window
  window.open('', '_self').close()
}

function LinkExpired({ modalName }) {
  React.useEffect(() => {
    // Set linkExpired flag in localStorage and mark the exam as completed
    localStorage.setItem(
      'linkExpired',
      JSON.stringify({ expired: true, module_name: modalName }),
    )
    localStorage.setItem('is_exam_completed', 'true')
  }, [modalName])

  return (
    <Modal
      title="Link Expired"
      open={true}
      footer={null}
      closable={false}
      className="link-expired-modal"
    >
      <div className="link-expired-content">
        {modalName === 'userComplete' ? (
          <>
            <p className="modal-message">
              The link has expired since you switched tabs frequently!
            </p>
            <Button className="card-button" onClick={goBack}>
              Exit Window
            </Button>
          </>
        ) : modalName === 'linkExpire' ? (
          <p className="modal-message">
            The quiz link has expired as the designated deadline for this activity
            has passed.
          </p>
        ) : (
          <>
            <p className="modal-message">
              The link has expired due to the time limit set for this activity.
            </p>
            <Button className="card-button" onClick={goBack}>
              Exit Window
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default LinkExpired
