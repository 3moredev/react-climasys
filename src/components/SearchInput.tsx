import React from 'react';
import { FormHelperText, IconButton } from '@mui/material';
import { Search, Close } from '@mui/icons-material';

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
    error?: boolean;
    helperText?: string;
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
    autoFocus = false,
    error,
    helperText
}, ref) => {
    const handleClear = () => {
        onChange('');
        if (onClear) {
            onClear();
        }
    };

    const maxLengthReached = value.length === 50;
    const displayError = error || maxLengthReached;
    const errorMsg = maxLengthReached ? "Search cannot exceed 50 characters" : helperText;

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
                        padding: showSearchIcon ? '8px 70px 8px 12px' : '8px 70px 8px 12px',
                        border: displayError ? (error ? '1px solid #d32f2f' : '1px solid #616161') : '1px solid #ced4da',
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

            {/* Error Message Space (Reserved to shift layout) */}
            {displayError && errorMsg && (
                <FormHelperText sx={{
                    color: error ? '#d32f2f !important' : '#757575 !important',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    margin: 0,
                    marginTop: '1px',
                    whiteSpace: 'normal',
                    maxWidth: '100%',
                    lineHeight: '1.2',
                    fontSize: '11px',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}>
                    {errorMsg}
                </FormHelperText>
            )}
        </div>
    );
});

export default SearchInput;
