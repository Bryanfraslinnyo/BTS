export default function Modal({ show, onClose, title, children, size = 'md' }) {
  if (!show) return null

  return (
    <div
      className="modal-overlay animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal modal-${size} animate-slideUp`}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
