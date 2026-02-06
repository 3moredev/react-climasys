import React from 'react';
import { TextField, InputAdornment, IconButton, TextFieldProps } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ClearableTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
}

const ClearableTextField: React.FC<ClearableTextFieldProps> = ({
    value,
    onChange,
    onClear,
    InputProps,
    disabled,
    ...otherProps
}) => {
    const handleClear = () => {
        onChange('');
        if (onClear) {
            onClear();
        }
    };

    const isReadOnly = disabled || !!InputProps?.readOnly;

    const helperText = otherProps.helperText as string;
    const isRequiredError = typeof helperText === 'string' && helperText.toLowerCase().includes('required');
    // We only want the 'error' state (red border) if it's a required field error.
    // Otherwise, it's just a warning/info message (gray text, normal border).
    const effectiveError = !!otherProps.error && isRequiredError;
    const shouldUseGrayError = !!otherProps.error && !isRequiredError;

    return (
        <TextField
            {...otherProps}
            error={effectiveError} // Override error prop to control border color
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            FormHelperTextProps={{
                sx: {
                    color: shouldUseGrayError ? '#333333 !important' : undefined
                }
            }}
            sx={{
                '& .MuiInputBase-root': {
                    paddingRight: '6px !important',
                    backgroundColor: isReadOnly ? '#f5f5f5 !important' : 'inherit',
                    cursor: isReadOnly ? 'not-allowed !important' : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: shouldUseGrayError ? '#616161 !important' : undefined,
                    borderWidth: shouldUseGrayError ? '1px !important' : undefined
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: shouldUseGrayError ? '#424242 !important' : undefined
                },
                ...(otherProps.sx || {}), // Apply external styles first
                '& .MuiInputBase-input': {
                    border: 'none !important',
                    boxShadow: 'none !important',
                    backgroundColor: isReadOnly ? '#f5f5f5 !important' : 'inherit',
                    cursor: isReadOnly ? 'not-allowed !important' : 'inherit',
                     '&::placeholder': {
                        color: isReadOnly ? '#666666 !important' : 'inherit',
                        opacity: isReadOnly ? '0.5 !important' : 1
                    },
                    ...(typeof otherProps.sx === 'object' && (otherProps.sx as any)?.['& .MuiInputBase-input'] ? (otherProps.sx as any)['& .MuiInputBase-input'] : {})
                }
            }}
            InputProps={{
                ...InputProps,
                endAdornment: (
                    <React.Fragment>
                        {value && !isReadOnly && (
                            <Close
                                onClick={handleClear}
                                style={{
                                    fontSize: '18px',
                                    color: '#757575',
                                    cursor: 'pointer',
                                    marginLeft: '4px',
                                    marginRight: '2px',
                                    background: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'block'
                                }}
                            />
                        )}
                        {InputProps?.endAdornment}
                    </React.Fragment>
                )
            }}
        />
    );
};

export default ClearableTextField;
