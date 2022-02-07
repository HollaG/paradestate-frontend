import { GetServerSidePropsContext, NextPage } from "next"
import { getSession, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Complete:NextPage = () => {
    // Do a refresh if the user is not logged in
    const router = useRouter()
    const {data:session} = useSession()
    console.log({session})
    useEffect(() => {
        if ((session && !session.user.company && !session.user.unit) || (session && session.user.company && session.user.unit && !session.user.platoon)) router.reload() // Refresh the page to reflect changes if the user came back to this page to set platoon (originally no platoon set.)
        if (session && session.user.company && session.user.unit) router.push("/")
    }, [session, router])
    return <>Redirecting you now...</>
}

export default Complete

// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//     const session = await getSession(context);
//     // if (session?.user?.company && session?.user?.unit) { // Only block this page if the user has set all company, unit and platoon. 
//     //    console.log("YES SESSION ALL DONE")
//     //     return {
//     //         redirect: {
//     //             destination: "/",
//     //             permanent: false,
//     //         },
//     //     };
//     // }
// } 