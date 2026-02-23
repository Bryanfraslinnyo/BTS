import Modal from './Modal.jsx'

export default function ConfirmModal({ show, onClose, onConfirm, title, message, confirmLabel = '🗑 Supprimer', confirmVariant = 'danger' }) {
  return (
    <Modal show={show} onClose={onClose} title={title} size="sm">
      <div className="modal-body">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {message}
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>
          Annuler
        </button>
        <button
          className={`btn btn-${confirmVariant}`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
