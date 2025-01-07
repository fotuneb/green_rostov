import { getCookie } from '../cookies'
const publicURL = process.env.REACT_APP_PUBLIC_URL;

// Отправка API запроса с передачей JSON
export const sendAPIRequestJSON = async (relativeUrl: string, 
                                         method: string, 
                                         authorized: boolean = true, 
                                         body: any = undefined, 
                                         contentType: any = undefined): Promise<Response> => 
{
    const headers: HeadersInit = {
        'accept': 'application/json'
    }

    if (authorized)
        headers['Authorization'] = 'Bearer ' + getCookie('token')

    if (body)
        headers['Content-Type'] = 'application/json'

    if (contentType && body)
        headers['Content-Type'] = contentType

    return await fetch(publicURL + relativeUrl, {
        method,
        headers,
        body: JSON.stringify(body)
    })
}

// Отправка API запроса с передачей URL-параметров
export const sendAPIRequestURLEncoded = async (relativeUrl: string, 
                                               method: string, 
                                               authorized: boolean = true, 
                                               body: any = undefined): Promise<Response> => 
{
    const headers: HeadersInit = {}

    if (authorized)
        headers['Authorization'] = 'Bearer ' + getCookie('token')

    const searchParams = new URLSearchParams();

    if (body) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        for (const key in body)
            searchParams.append(key, body[key])
    }

    return await fetch(publicURL + relativeUrl, {
        method,
        headers,
        body: searchParams.toString()
    })
}

// Отправка API запроса с передачей медиа-файла
export const sendAPIRequestMedia = async (relativeUrl: string, 
                                          method: string, 
                                          body: FormData,
                                          authorized: boolean = true): Promise<Response> => 
{
    const headers: HeadersInit = {}

    if (authorized)
        headers['Authorization'] = 'Bearer ' + getCookie('token')

    return await fetch(publicURL + relativeUrl, {
        method,
        headers,
        body: body
    })
}