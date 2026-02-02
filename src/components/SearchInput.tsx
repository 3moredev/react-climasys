import React from 'react';
import { Search, Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    placeholder?: string;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    showSearchIcon?: boolean;
    inputStyle?: React.CSSProperties;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    onKeyPress,
    className = '',
    disabled = false,
    showSearchIcon = true,
    inputStyle = {},
    onBlur,
    autoFocus = false
}, ref) => {
    const handleClear = () => {
        onChange('');
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className={`search-input-wrapper ${className}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%' }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    ref={ref}
                    style={{
                        width: '100%',
                        padding: showSearchIcon ? '8px 40px 8px 12px' : '8px 40px 8px 12px',
                        border: value.length === 50 ? '1px solid red' : '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        ...inputStyle
                    }}
                    maxLength={50}
                />
                {showSearchIcon && (
                    <Search
                        className="search-icon"
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#666',
                            fontSize: '20px',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                {value && (
                    <Close
                        onClick={handleClear}
                        style={{
                            position: 'absolute',
                            right: showSearchIcon ? '35px' : '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '18px',
                            color: '#757575',
                            cursor: 'pointer',
                            marginLeft: '4px',
                            marginRight: '2px',
                            background: 'none',
                            border: 'none',
                            boxShadow: 'none',
                            display: 'block',
                            opacity: disabled ? 0.5 : 1,
                            pointerEvents: disabled ? 'none' : 'auto'
                        }}
                    />
                )}
            </div>
            {value.length === 50 && (
                <span style={{
                    color: '#d32f2f',
                    fontSize: '0.75rem',
                    marginTop: '3px',
                    marginLeft: '14px',
                    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                    fontWeight: 400,
                    lineHeight: 1.66
                }}>
                    Search query cannot exceed 50 characters
                </span>
            )}
        </div>
    );
});

export default SearchInput;
