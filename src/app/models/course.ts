export interface Course {
    id?: number;

    source_language_id: number;
    target_language_id: number;

    use_target_language: number;
    use_source_language: number;

    pot_stack_id: number;
    failed_stack_id: number;
    success_stack_id: number;
}