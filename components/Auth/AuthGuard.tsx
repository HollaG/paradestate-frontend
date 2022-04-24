// AuthGuard.tsx
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../Sidebar";
import CustomLoadingBar from "../Skeleton/LoadingBar";

export function AuthGuard({ children }: { children: JSX.Element }) {
    const { user, initializing, setRedirect } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!initializing) {
            //auth is initialized and there is no user
            if (!user) {
                // remember the page that user tried to access
                // console.log("im here")

                setRedirect(router.route);
                // redirect
                router.push("/auth/login");
            }
        }
    }, [initializing, router, user, setRedirect]);

    /* show loading indicator while the auth provider is still initializing */
    if (initializing) {
        return <CustomLoadingBar/>;
    }

    // if auth initialized with a valid user show protected page
    console.log({initializing , user })
    if (!initializing && user && user.unit && user.company) {
        
        return children;
    } else if (!initializing && user && !user.unit && !user.company && !user.platoon) {
        router.push("/auth/registration")
    } 
    else if (!initializing && user && user.unit && user.company && !user.platoon) {
        router.push("/auth/registration")

    }

    /* otherwise don't return anything, will do a redirect from useEffect */
    return null;
}
