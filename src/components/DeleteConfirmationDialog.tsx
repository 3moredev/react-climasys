import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Close, Delete } from '@mui/icons-material';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string | React.ReactNode;
    loading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    message,
    loading = false
}) => {
    return (
        <Dialog
            open={open}
            onClose={() => !loading && onClose()}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <IconButton
                onClick={onClose}
                disabled={loading}
                disableRipple
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#fff',
                    backgroundColor: '#1E88E5',
                    '&:hover': {
                        backgroundColor: '#1976D2',
                    },
                    width: 36,
                    height: 36,
                    borderRadius: '8px'
                }}
            >
                <Close />
            </IconButton>
            <DialogTitle id="delete-dialog-title" sx={{ pt: 2, px: 3, pr: 7 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        bgcolor: '#1E88E5',
                        color: '#fff',
                        '&:hover': {
                            bgcolor: '#1976D2',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    autoFocus
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                        bgcolor: '#1E88E5',
                        color: '#fff',
                        '&:hover': {
                            bgcolor: '#1976D2',
                        }
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;
