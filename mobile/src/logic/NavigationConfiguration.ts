export type AppSection = 'hr' | 'health-safety' | null;

export type ScreenKey =
    | 'home'
    | 'calendar'
    | 'payslips'
    | 'handbook'
    | 'clockIn'
    | 'overview'
    | 'documents'
    | 'risk'
    | 'personal';

export type BottomNavItem = {
    key: ScreenKey;
    label: string;
    icon: string;
};

export const hrBottomNavItems: BottomNavItem[] = [
    { key: 'payslips', label: 'Payslips', icon: 'file-document-outline' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar-month-outline' },
    { key: 'home', label: 'Home', icon: 'home-outline' },
    { key: 'handbook', label: 'Handbook', icon: 'book-outline' },
    { key: 'clockIn', label: 'Clock - in', icon: 'clock-outline' },
];

export const healthSafetyBottomNavItems: BottomNavItem[] = [
    { key: 'documents', label: 'Documents', icon: 'file-document-outline' },
    { key: 'risk', label: 'Risk Assessments', icon: 'shield-alert-outline' },
    { key: 'home', label: 'Home', icon: 'home-outline' },
    { key: 'overview', label: 'Overview', icon: 'view-dashboard-outline' },
    { key: 'personal', label: 'Personal Info', icon: 'account-circle' },
];

export function getBottomNavItems(section: AppSection): BottomNavItem[] {
    switch (section) {
        case 'hr':
            return hrBottomNavItems;
        case 'health-safety':
            return healthSafetyBottomNavItems;
        default:
            return [];
    }
}