import type { Filter } from "../types";

/**
 * FilterButtons 컴포넌트
 *
 * 핵심 개념:
 * 1. 리터럴 타입 사용 (Filter)
 * 2. 배열 메서드 (map)
 * 3. 조건부 스타일링
 */

interface FilterButtonsProps {
    current: Filter;
    onChange: (filter: Filter) => void;
}

export function FilterButtons({ current, onChange }: FilterButtonsProps) {
    const filters: { value: Filter; label: string }[] = [
        { value: "all", label: "전체" },
        { value: "active", label: "진행중" },
        { value: "completed", label: "완료" }
    ];

    return (
        <div style={styles.container}>
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onChange(filter.value)}
                    style={{
                        ...styles.button,
                        // 조건부 스타일링
                        backgroundColor: current === filter.value ? "#667eea" : "white",
                        color: current === filter.value ? "white" : "#333"
                    }}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        gap: "8px",
        marginBottom: "20px"
    },
    button: {
        flex: 1,
        padding: "10px 16px",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.2s"
    }
};
