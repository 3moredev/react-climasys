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

    const parts = [
        patientData?.patient,
        patientData?.gender,
        getAgeString(),
        patientData?.contact
    ].filter(Boolean);

    const patientName = parts.join(' / ');

    return (
        <div
            onClick={onClick}
            style={style}
            className={className}
            title={title}
        >
            {patientName}
        </div>
    );
};

export default PatientNameDisplay;
