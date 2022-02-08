import { GetServerSidePropsContext, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Complete: NextPage = () => {
    // Do a refresh if the user is not logged in
    // const router = useRouter();
    // const { data: session } = useSession();
    // console.log({ session });
    

    // useEffect(() => {
    //     if (
    //         Boolean(router.query.change) &&
    //         !localStorage.getItem("refreshed")
    //     ) {
    //         // router.push("/auth/registration");
    //         // Use locastorage hack
    //         localStorage.setItem("refreshed", "true");
    //         router.reload();
    //         return
    //     } else {
    //         if (
    //             (session && !session.user.company && !session.user.unit) ||
    //             (session &&
    //                 session.user.company &&
    //                 session.user.unit &&
    //                 !session.user.platoon)
    //         )
    //             router.reload(); // Refresh the page to reflect changes if the user came back to this page to set platoon (originally no platoon set.) OR when user changes platoon here (query param of change=1 is present in url)
    //         if (session && session.user.company && session.user.unit) {
    //             router.push("/");
    //             localStorage.removeItem("refreshed");
    //         }
    //     }
    // }, [session, router]);
    return <>Redirecting you now...</>;
};

export default Complete;

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
