export interface APIResponseSuccess<T = string> {
    msg: T;
}

export interface APIResponseError<T = string | []> {
    detail: T;
}

