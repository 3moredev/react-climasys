import React from 'react';
import dayjs from 'dayjs';

interface PatientNameDisplayProps {
    patientData: any;
    onClick?: () => void;
    style?: React.CSSProperties;
    className?: string;
    title?: string;
}

const PatientNameDisplay: React.FC<PatientNameDisplayProps> = ({
    patientData,
    onClick,
    style,
    className,
    title
}) => {
    const getAgeString = () => {
        if (patientData?.dob) {
            const birthDate = dayjs(patientData.dob);
            if (birthDate.isValid()) {
                const years = dayjs().diff(birthDate, 'year');
                return years > 0 ? `${years} Y` : `${dayjs().diff(birthDate, 'month')} M`;
            }
        }
        return patientData?.age !== undefined ? `${patientData.age} ${patientData.age > 1 ? 'Y' : 'M'}` : '';
    };

    const originalName = patientData?.patient || '';
    const name = originalName.length > 25 ? `${originalName.substring(0, 25)}...` : originalName;

    const parts = [
        name,
        patientData?.gender,
        getAgeString(),
        patientData?.contact ? patientData?.contact : 'NA'
    ].filter(Boolean);

    const patientName = parts.join(' / ');
    
    return (
        <div
            onClick={onClick}
            style={style}
            className={className}
            title={title || originalName}
        >
            {patientName}
        </div>
    );
};

export default PatientNameDisplay;
