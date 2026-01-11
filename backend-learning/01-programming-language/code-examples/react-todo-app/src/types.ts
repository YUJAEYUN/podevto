/**
 * TODO 항목 타입
 */
export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
}

/**
 * 필터 타입 (리터럴 타입)
 */
export type Filter = "all" | "active" | "completed";
