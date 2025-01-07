// User role enum
export enum UserRole {
    Guest = "guest",
    Admin = "admin",
}

// Базовый тип объекта запроса к эндпоинтам юзера
interface _BaseUserRequestType {
    fullname: string
    username: string
    login: string
    password: string
    password1: string
    current_password: string
    new_password: string
    about: string
}

// Типы объектов запроса к эндпоинтам категории "User"
export type UserCreateAPIRequest = Pick<_BaseUserRequestType, 
    'fullname' | 'login' | 'password1'>;
export type UserLoginAPIRequest = Pick<_BaseUserRequestType, 
    'username' | 'password'>;
export type UserChangePublicInfoAPIRequest = Pick<_BaseUserRequestType, 
    'fullname' | 'about'>;
export type UserChangePasswordAPIRequest = Pick<_BaseUserRequestType, 
    'current_password' | 'new_password'>;


// User API Response Body Types
export interface UserCreateAPIResponse {
    accessToken: string
}
export interface UserLoginAPIResponse {
    accessToken: string
}
export interface UserObjectAPIResponse {
    id: number,
    fullname: string,
    role: UserRole,
    avatar_id: number | null,
    about: string | null,
    login: string
}
export interface UserTgLinkAPIResponse {
    telegram_link: string
}
