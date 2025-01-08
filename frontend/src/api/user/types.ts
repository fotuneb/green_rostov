// User role enum
export enum UserRole {
    Guest = "guest",
    Admin = "admin",
}

// Базовый тип объекта запроса к эндпоинтам категории "User"
interface BaseUserRequestType {
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
export type UserCreateObject = Pick<BaseUserRequestType, 
    'fullname' | 'login' | 'password1'>;
export type UserLoginObject = Pick<BaseUserRequestType, 
    'username' | 'password'>;
export type UserPublicInfoObject = Pick<BaseUserRequestType, 
    'fullname' | 'about'>;
export type UserPasswordObject = Pick<BaseUserRequestType, 
    'current_password' | 'new_password'>;


// Базовый тип объекта ответа с эндпоинтов категории "User"
interface BaseUserResponseType {
    accessToken?: string
    id?: number
    role?: UserRole
    fullname?: string | null
    avatar_id?: number | null
    about?: string | null
    login?: string
    telegram_link?: string
}

// Типы объектов ответа с эндпоинтов категории "User"
export type UserObjectAPIResponse = Omit<BaseUserResponseType, 
    'accessToken' | 'telegram_link'>
export type UserCreateAPIResponse = Pick<BaseUserResponseType, 
    'accessToken'>
export type UserLoginAPIResponse = Pick<BaseUserResponseType, 
    'accessToken'>
export type UserTgLinkAPIResponse = Pick<BaseUserResponseType, 
    'telegram_link'>