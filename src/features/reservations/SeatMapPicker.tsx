'use client';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SeatMapPickerProps {
    takenSeats: string[];
    selectedSeat: string | null;
    onSeatSelect: (seat: string) => void;
}

// Full theater layout — all 14 rows A–N
// left/right = number of seats per side (odd/even)
const ALL_ROWS: { label: string; left: number; right: number }[] = [
    { label: 'A', left: 7,  right: 7  },
    { label: 'B', left: 7,  right: 7  },
    { label: 'C', left: 8,  right: 8  },
    { label: 'D', left: 8,  right: 8  },
    { label: 'E', left: 9,  right: 9  },
    { label: 'F', left: 9,  right: 9  },
    { label: 'G', left: 11, right: 11 },
    { label: 'H', left: 11, right: 11 },
    { label: 'I', left: 12, right: 12 },
    { label: 'J', left: 12, right: 12 },
    { label: 'K', left: 13, right: 13 },
    { label: 'L', left: 11, right: 11 },
    { label: 'M', left: 12, right: 12 },
    { label: 'N', left: 13, right: 13 },
];

const BOOKABLE_ROWS = new Set(['G', 'H', 'I', 'J', 'K', 'L']);

// Category colors (inline styles matching the HTML reference)
type CategoryStyle = { background: string; border: string; color: string };

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    committee: { background: 'linear-gradient(to bottom,#b45309,#6b2600)', border: '#fbbf2455', color: '#fef9c3' },
    guests:    { background: 'linear-gradient(to bottom,#0f766e,#134e4a)', border: '#5eead455', color: '#ccfbf1' },
    doctors:   { background: 'linear-gradient(to bottom,#475569,#1e293b)', border: '#94a3b855', color: '#e2e8f0' },
    press:     { background: 'linear-gradient(to bottom,#ea580c,#7c2d12)', border: '#fdba7455', color: '#ffedd5' },
    directors: { background: 'linear-gradient(to bottom,#be185d,#6d0030)', border: '#f9a8d455', color: '#fce7f3' },
    family:    { background: 'linear-gradient(to bottom,#1d4ed8,#1e3a8a)', border: '#93c5fd55', color: '#dbeafe' },
    students:  { background: 'linear-gradient(to bottom,#16a34a,#14532d)', border: '#86efac55', color: '#dcfce7' },
    public:    { background: 'linear-gradient(to bottom,#7c3aed,#3b0764)', border: '#a78bfa55', color: '#ede9fe' },
};

function getCategory(rowLabel: string, side: 'left' | 'right'): keyof typeof CATEGORY_STYLES {
    if (rowLabel === 'A') return 'committee';
    if (rowLabel === 'B' && side === 'left') return 'guests';
    if (rowLabel === 'B' && side === 'right') return 'doctors';
    if (rowLabel === 'C') return 'guests';
    if (rowLabel === 'D') return 'press';
    if (rowLabel === 'E' || rowLabel === 'F') return 'family';
    if (BOOKABLE_ROWS.has(rowLabel)) return 'students';
    return 'public';
}

// Fixed block width based on max 13 seats: 13×20 + 12×2 = 284px
const SEAT_SIZE = 20;
const SEAT_GAP = 2;
const MAX_SEATS = 13;
const BLOCK_WIDTH = MAX_SEATS * SEAT_SIZE + (MAX_SEATS - 1) * SEAT_GAP;

const LEGEND_ITEMS = [
    { key: 'committee', labelAr: 'اللجنة' },
    { key: 'guests',    labelAr: 'الضيوف' },
    { key: 'doctors',   labelAr: 'الدكاترة' },
    { key: 'press',     labelAr: 'صحافة ولجنة نشر' },
    { key: 'family',    labelAr: 'أهالي' },
    { key: 'students',  labelAr: 'طلبة' },
    { key: 'public',    labelAr: 'جمهور عام' },
];

export const SeatMapPicker = ({ takenSeats, selectedSeat, onSeatSelect }: SeatMapPickerProps) => {
    const { t } = useTranslation();
    const takenSet = new Set(takenSeats);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const overflow = el.scrollWidth - el.clientWidth;
        // In RTL, scrollLeft is 0 at the right edge and negative going left
        el.scrollLeft = -(overflow / 2);
    }, []);

    return (
        <div ref={scrollRef} className="w-full overflow-x-auto seat-map-scroll pb-2">
        <div className="min-w-max mx-auto flex flex-col items-center gap-1">
            {/* Stage arch */}
            <div
                className="w-full flex items-center justify-center text-[#fef3c7] font-bold tracking-[0.4em] text-sm"
                style={{
                    borderRadius: '0 0 60% 60% / 0 0 32px 32px',
                    background: 'linear-gradient(to bottom, #57534e, #1c1917)',
                    border: '1px solid rgba(251,191,36,0.2)',
                    borderTop: 'none',
                    padding: '0.75rem 4rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 -4px 12px rgba(0,0,0,0.3)',
                    marginBottom: '3px',
                }}
            >
                STAGE
            </div>

            {/* Footlight glow */}
            <div
                style={{
                    height: '2px',
                    width: '100%',
                    background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.5), transparent)',
                    filter: 'blur(1px)',
                    marginBottom: '6px',
                }}
            />

            {/* Block headers */}
            <div
                className="flex items-center text-[9px] tracking-widest uppercase"
                style={{
                    color: 'rgba(253,230,138,0.5)',
                    width: `${BLOCK_WIDTH * 2 + 24 + 24 * 2}px`,
                    marginBottom: '2px',
                }}
            >
                <div style={{ width: 24 }} />
                <div style={{ width: BLOCK_WIDTH, textAlign: 'right' }}>{t('reservation.seatMap.rightBlock')}</div>
                <div style={{ width: 24 }} />
                <div style={{ width: BLOCK_WIDTH, textAlign: 'left' }}>{t('reservation.seatMap.leftBlock')}</div>
                <div style={{ width: 24 }} />
            </div>

            {/* Rows */}
            <div className="flex flex-col" style={{ gap: `${SEAT_GAP + 1}px` }}>
                {ALL_ROWS.map(({ label, left, right }) => {
                    const bookable = BOOKABLE_ROWS.has(label);

                    // Left block: even seats descending (e.g. A12, A10, …, A2) — nearest aisle = smallest even
                    const leftSeats: number[] = [];
                    for (let i = left; i >= 1; i--) leftSeats.push(2 * i);

                    // Right block: odd seats ascending (e.g. A1, A3, …, A11)
                    const rightSeats: number[] = [];
                    for (let i = 1; i <= right; i++) rightSeats.push(2 * i - 1);

                    const leftCat = getCategory(label, 'right');
                    const rightCat = getCategory(label, 'left');

                    return (
                        <div key={label} className="flex items-center" style={{ gap: '4px', marginTop: label === 'L' ? 10 : undefined }}>
                            {/* Row label left */}
                            <div
                                className="font-mono font-bold text-center shrink-0"
                                style={{ width: 24, fontSize: 11, color: 'rgba(251,191,36,0.6)' }}
                            >
                                {label}
                            </div>

                            {/* Left block — fixed width, seats flush to aisle (justify-end) */}
                            <div
                                className="flex justify-end shrink-0"
                                style={{ width: BLOCK_WIDTH, gap: `${SEAT_GAP}px` }}
                            >
                                {leftSeats.map(num => {
                                    const seatId = `${label}${num}`;
                                    if (!bookable) {
                                        return (
                                            <DecorativeSeat
                                                key={seatId}
                                                category={leftCat}
                                            />
                                        );
                                    }
                                    return (
                                        <BookableSeat
                                            key={seatId}
                                            seatId={seatId}
                                            taken={takenSet.has(seatId)}
                                            selected={selectedSeat === seatId}
                                            onSelect={onSeatSelect}
                                        />
                                    );
                                })}
                            </div>

                            {/* Aisle */}
                            <div
                                className="shrink-0"
                                style={{
                                    width: 24,
                                    height: SEAT_SIZE,
                                    borderRadius: 9999,
                                    border: '1px dashed rgba(251,191,36,0.2)',
                                    background: 'rgba(255,255,255,0.02)',
                                }}
                            />

                            {/* Right block — fixed width, seats flush to aisle (justify-start) */}
                            <div
                                className="flex justify-start shrink-0"
                                style={{ width: BLOCK_WIDTH, gap: `${SEAT_GAP}px` }}
                            >
                                {rightSeats.map(num => {
                                    const seatId = `${label}${num}`;
                                    if (!bookable) {
                                        return (
                                            <DecorativeSeat
                                                key={seatId}
                                                category={rightCat}
                                            />
                                        );
                                    }
                                    return (
                                        <BookableSeat
                                            key={seatId}
                                            seatId={seatId}
                                            taken={takenSet.has(seatId)}
                                            selected={selectedSeat === seatId}
                                            onSelect={onSeatSelect}
                                        />
                                    );
                                })}
                            </div>

                            {/* Row label right */}
                            <div
                                className="font-mono font-bold text-center shrink-0"
                                style={{ width: 24, fontSize: 11, color: 'rgba(251,191,36,0.6)' }}
                            >
                                {label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3" style={{ maxWidth: `${BLOCK_WIDTH * 2 + 80}px` }}>
                {LEGEND_ITEMS.map(({ key, labelAr }) => {
                    const style = CATEGORY_STYLES[key];
                    return (
                        <div key={key} className="flex items-center gap-1.5">
                            <span
                                className="shrink-0"
                                style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '3px 3px 1px 1px',
                                    background: style.background,
                                    border: style.border,
                                    display: 'inline-block',
                                }}
                            />
                            <span className="text-[10px] text-primary-500 dark:text-primary-400">{labelAr}</span>
                        </div>
                    );
                })}
            </div>
        </div>
        </div>
    );
};

// Non-bookable seat — decorative only, no interaction
const DecorativeSeat = ({ category }: { category: keyof typeof CATEGORY_STYLES }) => {
    const style = CATEGORY_STYLES[category];
    return (
        <div
            style={{
                width: SEAT_SIZE,
                height: SEAT_SIZE,
                borderRadius: '4px 4px 2px 2px',
                background: style.background,
                border: `1px solid ${style.border}`,
                flexShrink: 0,
                cursor: 'default',
            }}
        />
    );
};

// Bookable seat — available / taken (red) / selected (amber)
interface BookableSeatProps {
    seatId: string;
    taken: boolean;
    selected: boolean;
    onSelect: (seatId: string) => void;
}

const BookableSeat = ({ seatId, taken, selected, onSelect }: BookableSeatProps) => {
    const baseStyle: React.CSSProperties = {
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        borderRadius: '4px 4px 2px 2px',
        flexShrink: 0,
        fontSize: 7,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-monospace, monospace',
    };

    if (taken) {
        return (
            <div
                title={seatId}
                style={{
                    ...baseStyle,
                    background: 'linear-gradient(to bottom,#b91c1c,#7f1d1d)',
                    border: '1px solid #f8717155',
                    color: '#fecaca',
                    cursor: 'not-allowed',
                }}
            >
                ✕
            </div>
        );
    }

    if (selected) {
        return (
            <button
                type="button"
                title={seatId}
                onClick={() => onSelect(seatId)}
                style={{
                    ...baseStyle,
                    background: 'linear-gradient(to bottom,#d97706,#92400e)',
                    border: '1px solid #fbbf2488',
                    color: '#fef9c3',
                    outline: '2px solid #fbbf24',
                    outlineOffset: '1px',
                    cursor: 'pointer',
                }}
            >
                {seatId.slice(1)}
            </button>
        );
    }

    return (
        <button
            type="button"
            title={seatId}
            onClick={() => onSelect(seatId)}
            style={{
                ...baseStyle,
                background: 'linear-gradient(to bottom,#16a34a,#14532d)',
                border: '1px solid #86efac55',
                color: '#dcfce7',
                cursor: 'pointer',
            }}
        >
            {seatId.slice(1)}
        </button>
    );
};
