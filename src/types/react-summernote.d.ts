declare module 'react-summernote' {
    import React from 'react';

    export interface ReactSummernoteProps {
        value?: string;
        defaultValue?: string;
        children?: React.ReactNode;
        options?: any;
        onInit?: (note: any) => void;
        onEnter?: (ev: any) => void;
        onFocus?: (ev: any) => void;
        onBlur?: (ev: any) => void;
        onKeyUp?: (ev: any) => void;
        onKeyDown?: (ev: any) => void;
        onPaste?: (ev: any) => void;
        onChange?: (content: string) => void;
        onImageUpload?: (files: File[]) => void;
    }

    const ReactSummernote: React.FC<ReactSummernoteProps>;
    export default ReactSummernote;
}
