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
    const isError = message.includes("doesn't have") || 
                    message.includes("Failed to book") || 
                    message.includes("Please select") || 
                    message.includes("existing appointment") || 
                    message.includes("Unable to determine") || 
                    message.includes("Missing identifiers") || 
                    message.includes("Update failed") || 
                    message.includes("Failed to update") || 
                    message.includes("Failed to delete") || 
                    message.includes("but failed to refresh") ||
                    message.toLowerCase().includes("failed") ||
                    message.toLowerCase().includes("error");

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
                backgroundColor: isError ? '#dc3545' : '#28a745',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 9999,
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

