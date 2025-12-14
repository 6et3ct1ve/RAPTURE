import './Modal.css';

function Modal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="btn-danger">CONFIRM</button>
          <button onClick={onClose} className="btn-secondary">CANCEL</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;