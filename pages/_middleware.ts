import { IncomingMessage } from 'http'
import { IncomingRequest } from 'next-auth'
import { getSession } from 'next-auth/react'
import { NextResponse, NextRequest, NextFetchEvent } from 'next/server'
export async function middleware(req: IncomingMessage, ev: NextFetchEvent) {
 
    // const url = req.url
    // const session = await getSession({req})
    // console.log(session)
    // if (url === "/login")
    return NextResponse.next()
    // if (!session) {
    //     return NextResponse.redirect('/login')
    // }
    // return NextResponse.next()
}