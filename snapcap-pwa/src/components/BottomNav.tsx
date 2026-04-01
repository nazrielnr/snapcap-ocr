import { Home, Receipt, PieChart, User } from 'lucide-react'
import type { AppView } from '../types'
import type { Translations } from '../i18n'

interface Props {
    active: AppView
    onNavigate: (v: AppView) => void
    t?: Translations
}

export default function BottomNav({ active, onNavigate, t }: Props) {
    const items = [
        { id: 'dashboard' as AppView, label: t?.dashboard ?? 'Home', Icon: Home },
        { id: 'expenses' as AppView, label: t?.expenses ?? 'Activity', Icon: Receipt },
        { id: 'reports' as AppView, label: t?.reports ?? 'Reports', Icon: PieChart },
        { id: 'profile' as AppView, label: t?.profile ?? 'Profile', Icon: User },
    ]
    return (
        <nav className="bottom-nav" role="navigation" aria-label="Main Navigation">
            {items.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    className={`nav-item ${active === id ? 'active' : ''}`}
                    onClick={() => onNavigate(id)}
                    aria-label={label}
                    aria-current={active === id ? 'page' : undefined}
                >
                    <span className="nav-icon-wrap">
                        <Icon size={20} strokeWidth={active === id ? 2.5 : 1.75} />
                    </span>
                    <span>{label}</span>
                </button>
            ))}
        </nav>
    )
}
