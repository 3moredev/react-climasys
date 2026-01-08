import React from 'react';

interface GlobalSnackbarProps {
    show: boolean;
    message: string;
    onClose?: () => void;
    autoHideDuration?: number;
}

const GlobalSnackbar: React.FC<GlobalSnackbarProps> = ({
    show,
    message,
    onClose,
    autoHideDuration = 5000
}) => {
    // Determine if message is an error based on expanded error keywords
    const errorKeywords = [
        "at least one lab test",
        "at least one lab",
        "required fields",
        "value for each result",
        "failed",
        "error",
        "unable",
        "invalid",
        "missing",
        "required",
        "already",
        "conflict",
        "doesn't have",
        "not found",
        "failed to",
        "please select",
        "please enter",
        "please provide",
        "not available",
        "not permitted",
        "not allowed",
        "not authorized",
        "not found",
        "not match",
        "not exist",
        "cannot",
        "could not",
        "wrong",
        "incorrect",
        "at least",
        "no patient",
        "no record",
        "no data",
        "duplicate",
        "denied",
        "forbidden",
        "unauthorized",
        "timeout",
        "refused",
        "exception",
        "bad request",
        "incomplete",
        "check your",
        "missing id",
        "failure",
        "something went wrong",
        "problem",
        "issue occurred",
        "server error",
        "network error",
        "connection refused",
        "not ",
        "no ",
        "denied",
        "forbidden"
    ];

    const isError = errorKeywords.some(keyword => message.toLowerCase().includes(keyword));

    // Auto-hide functionality
    React.useEffect(() => {
        if (show && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [show, onClose, autoHideDuration]);

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: isError ? '#d32f2f' : '#2e7d32',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 999999,
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                fontSize: '0.9rem',
                maxWidth: '400px',
                animation: 'slideInUp 0.3s ease-out',
                WebkitAnimation: 'slideInUp 0.3s ease-out'
            }}
        >
            <div className="d-flex align-items-center">
                <i className={`fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
                <span>{message}</span>
            </div>
        </div>
    );
};

export default GlobalSnackbar;

