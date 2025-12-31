import { useSearchParams } from 'react-router-dom';
import ManageSubCategory from './ManageSubCategory';
import ManageInsuranceCompany from './ManageInsuranceCompany';

export default function Settings() {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('t');

    // Render appropriate component based on query parameter
    if (tab === 'insurance') {
        return <ManageInsuranceCompany />;
    } else if (tab === 'sub-category') {
        return <ManageSubCategory />;
    }

    // Default to sub-category if no tab specified
    return <ManageSubCategory />;
}

