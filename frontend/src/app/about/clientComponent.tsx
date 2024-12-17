//client-side: interacts with cookies, renders UI

'use client'; //Marker: client-side
import { getCookie, setCookie } from 'cookies-next' //cookies-next package manages cookies
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function MyClientComponent({
    initial, //initial prop provides cookie valued fetched from server side
}: {
    initial: { cookieClient?: string }
}) {
    const [cookieClient, setcookieClient] = useState(
        //initiallises cookie state into one of the following: client-side cookie val, server-side cookie fallback, empty string (neither)
        getCookie('CookieFromServer')?.toString() ?? initial.cookieClient ?? '',
    )

    useEffect(() => {
        setCookie('cookieClient', cookieClient,{maxAge:3600 * 1000})
    }, [cookieClient])

    //?
    return (<>
        <h1>Hi from About</h1>
            
        <h1>cookies{cookieClient}</h1>

        <Link href='/about/me'>Click To Me Page</Link>
        
        <Link href='/studentPerformance'> student Performance</Link>
        </>
    )
}