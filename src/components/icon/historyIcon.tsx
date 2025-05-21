export default function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <g transform="translate(5, 6)">
                <path d="M5 5v7h7" />
                <path d="M5.05 17A13 13 0 1 0 8 7.3L5 10" />
                <path d="M16 9v7l6 3" />
            </g>
        </svg>
    )
}
