import { cookies } from 'next/headers'
import { MyClientComponent } from './clientComponent'

export default async function About() {
    // Server-side: based on HTTP resquest cookie only
    const cookieFromServer = (await cookies()).get('CookieFromServer')?.value //retrieves value of cookie from HTTP req
    console.log((await cookies()).get('CookieFromServer'))
    return <MyClientComponent initial={{ cookieClient:cookieFromServer }} /> //client-side component is rendered
}