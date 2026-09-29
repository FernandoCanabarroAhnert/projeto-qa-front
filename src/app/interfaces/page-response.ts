export interface IPageResponse<T> {
    content: T[];
    numberOfElements: number;
    totalElements: number;
    number: number;
    totalPages: number;
}