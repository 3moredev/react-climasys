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
    ...otherProps
}) => {
    const handleClear = () => {
        onChange('');
        if (onClear) {
            onClear();
        }
    };

    return (
        <TextField
            {...otherProps}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            InputProps={{
                ...InputProps,
                endAdornment: (
                    <React.Fragment>
                        {value && (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClear}
                                    edge="end"
                                    size="small"
                                    sx={{
                                        padding: '4px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                    aria-label="clear"
                                >
                                    <Close style={{ fontSize: '18px', color: '#666' }} />
                                </IconButton>
                            </InputAdornment>
                        )}
                        {InputProps?.endAdornment}
                    </React.Fragment>
                )
            }}
        />
    );
};

export default ClearableTextField;
