'use server'

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();
        const response = await axios.post(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/auth/register`, {name ,email, password, role }); //calls backend (dto)
        if (response.status === 201) {
            const res = NextResponse.json({ message: 'Register successful' });
            return res;
        }
        return NextResponse.json({ error: 'Register failed' }, { status: response.status });
    } catch (error) {

        if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            return NextResponse.json(
                { error: data.message || 'An unexpected error occurred.' },
                { status }
            );
        }
        
        // if (axios.isAxiosError(error) && error.response) {
        //     return NextResponse.json(
        //         { error: error.response.data.message.message || 'Server error' },
        //         { status: error.response.status }
        //     );
        // }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}