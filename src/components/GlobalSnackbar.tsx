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
    // Determine if message is an error based on error keywords
    const isError = message.toLowerCase().includes("at least one lab test") ||
        message.toLowerCase().includes("at least one lab") ||
        message.toLowerCase().includes("required fields") ||
        message.toLowerCase().includes("value for each result") ||
        message.toLowerCase().includes("failed") ||
        message.toLowerCase().includes("error") ||
        message.toLowerCase().includes("unable") ||
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("missing") ||
        message.toLowerCase().includes("required") ||
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("conflict") ||
        message.toLowerCase().includes("doesn't have") ||
        message.toLowerCase().includes("not found") ||
        message.toLowerCase().includes("failed to") ||
        message.toLowerCase().includes("please select");

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

