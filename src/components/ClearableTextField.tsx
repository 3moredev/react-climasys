import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ClearableTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    disableClearable?: boolean;
}

const ClearableTextField: React.FC<ClearableTextFieldProps> = ({
    value,
    onChange,
    onClear,
    InputProps,
    disabled,
    disableClearable,
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
    // If it's just a length warning (e.g. "cannot exceed", "exceeds maximum"), it can remain gray.
    const isLengthWarning = typeof helperText === 'string' && (
        helperText.toLowerCase().includes('exceed') ||
        helperText.toLowerCase().includes('character limit') ||
        helperText.toLowerCase().includes('max length') ||
        helperText.toLowerCase().includes('limit reached')
    );

    // Any error that is not just a length warning should be red.
    const effectiveError = !!otherProps.error && !isLengthWarning;
    const shouldUseGrayError = isLengthWarning; // Always show length warnings in gray, even if error=true

    return (
        <TextField
            {...otherProps}
            error={effectiveError}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            FormHelperTextProps={{
                ...(otherProps.FormHelperTextProps as any),
                sx: {
                    ...(otherProps.FormHelperTextProps?.sx as any),
                    color: shouldUseGrayError ? '#666 !important' : (otherProps.FormHelperTextProps?.sx as any)?.color,
                    margin: 0,
                    marginTop: '4px',
                    whiteSpace: 'normal',
                    maxWidth: '100%',
                    lineHeight: '1.2',
                    fontSize: '11px'
                }
            }}
            sx={{
                position: 'relative',
                marginBottom: '0px', // Removed fixed margin since helper text now takes space
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
                ...((otherProps.sx as any) || {}),
                '& .MuiInputBase-input': {
                    border: 'none !important',
                    boxShadow: 'none !important',
                    backgroundColor: isReadOnly ? '#f5f5f5 !important' : 'inherit',
                    cursor: isReadOnly ? 'not-allowed !important' : 'inherit',
                    fontSize: 'inherit',
                    '&::placeholder': {
                        color: effectiveError ? '#d32f2f !important' : '#666 !important',
                        opacity: isReadOnly ? '0.5 !important' : 1,
                        fontSize: 'inherit'
                    },
                    '&.Mui-disabled::placeholder': {
                        color: '#666666 !important',
                        opacity: '0.5 !important',
                        fontSize: 'inherit'
                    },
                    ...(typeof otherProps.sx === 'object' && (otherProps.sx as any)?.['& .MuiInputBase-input'] ? (otherProps.sx as any)['& .MuiInputBase-input'] : {})
                }
            }}
            InputProps={{
                ...InputProps,
                endAdornment: (
                    <React.Fragment>
                        {value && !isReadOnly && !disableClearable && (
                            <CloseIcon
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
