import { createTheme } from '@mui/material/styles';

const AppTheme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    components: {
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '4px 20px 8px',
                    '& .MuiTextField-root, & .MuiFormControl-root': { width: '100%' },
                    // Match Appointment page input/select height (38px)
                    '& .MuiTextField-root .MuiOutlinedInput-root, & .MuiFormControl-root .MuiOutlinedInput-root': { height: 38 },
                    // Typography and padding to match Appointment inputs
                    '& .MuiInputBase-input, & .MuiSelect-select': {
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 500,
                        padding: '6px 12px',
                        lineHeight: 1.5
                    },
                    // Outline thickness and colors (normal and focused)
                    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: '#B7B7B7',
                        borderRadius: '8px'
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#999',
                        borderRadius: '8px'
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: '#1E88E5',
                        borderRadius: '8px'
                    },
                    // Add border radius to all input elements
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        boxShadow: 'none'
                    },
                    '& .Mui-error .MuiOutlinedInput-notchedOutline':{
                        borderColor: '#d32f2f !important',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none !important' },
                    // Consistent error message styling
                    '& .MuiFormHelperText-root': {
                        fontSize: '0.75rem',
                        lineHeight: 1.66,
                        fontFamily: "'Roboto', sans-serif",
                        margin: '3px 0 0 0 !important',
                        padding: '0 !important',
                        minHeight: '1.25rem',
                        textAlign: 'left !important',
                        color: '#d32f2f', // Ensure red color for error text
                        position: 'absolute',
                        bottom: '-24px',
                        left: 0
                    },
                    '& .MuiBox-root': { mb: 0 },
                    '& .MuiTypography-root': { mb: 0.25 },
                    position: 'relative',
                    // Disabled look similar to Appointment header select
                    '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input, & .MuiOutlinedInput-root.Mui-disabled .MuiSelect-select': {
                        backgroundColor: '#ECEFF1',
                        WebkitTextFillColor: 'inherit'
                    },
                    // Autocomplete styling to match other inputs and remove inner borders
                    '& .MuiAutocomplete-root .MuiAutocomplete-input': {
                        opacity: 1,
                        border: 'none !important',
                        outline: 'none !important'
                    },
                    '& .MuiAutocomplete-root .MuiOutlinedInput-root': {
                        height: 38,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        padding: '0 !important'
                    },
                    '& .MuiAutocomplete-root .MuiOutlinedInput-root .MuiOutlinedInput-input': {
                        border: 'none !important',
                        outline: 'none !important',
                        padding: '6px 12px !important'
                    },
                    '& .MuiAutocomplete-root .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: '#B7B7B7',
                        borderRadius: '8px'
                    },
                    '& .MuiAutocomplete-root .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#999',
                        borderRadius: '8px'
                    },
                    '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: '#1E88E5',
                        borderRadius: '8px'
                    }
                }
            }
        }
    }
});

export default AppTheme;
