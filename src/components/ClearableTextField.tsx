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

    return (
        <TextField
            {...otherProps}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{
                '& .MuiInputBase-root': {
                    paddingRight: '6px !important',
                },
                '& .MuiInputBase-input': {
                    border: 'none !important',
                    boxShadow: 'none !important',
                },
                ...otherProps.sx
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
