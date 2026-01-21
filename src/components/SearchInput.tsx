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
        <div className={`search-input-wrapper ${className}`} style={{ position: 'relative' }}>
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
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    ...inputStyle
                }}
            />
            {showSearchIcon && !value && (
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
                <IconButton
                    onClick={handleClear}
                    disabled={disabled}
                    size="small"
                    sx={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '4px',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                    aria-label="Clear search"
                >
                    <Close style={{ fontSize: '18px', color: '#333' }} />
                </IconButton>
            )}
        </div>
    );
});

export default SearchInput;
