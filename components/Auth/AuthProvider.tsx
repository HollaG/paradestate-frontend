import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
// import { Auth } from "../../lib/auth";
import { User } from '../../types/database'

// const auth = new Auth(); // singleton

const redirectKey = "sign_in_redirect";

export const AuthContext = React.createContext<
    | {
        //   auth: Auth;
          initializing: boolean;
          user: User | null;
          error: { message: string } | null;
          setRedirect: (redirect: string) => void;
          getRedirect: () => string | null;
          clearRedirect: () => void;
      }
    | undefined
>(undefined);

AuthContext.displayName = "AuthContext";

function setRedirect(redirect: string) {
    window.sessionStorage.setItem(redirectKey, redirect);
}

function getRedirect(): string | null {
    return window.sessionStorage.getItem(redirectKey);
}

function clearRedirect() {
    return window.sessionStorage.removeItem(redirectKey);
}
export function useAuth() {
    const auth = React.useContext(AuthContext);

    if (!auth) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return auth;
}

export function AuthProvider({ children }: { children: JSX.Element }) {
    console.log("Auth providier rerendering")
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<{ message: string } | null>(null);
    const [initializing, setInitializing] = useState(true);

    const { data: session, status } = useSession()
   
    useEffect(() => {
        
        setInitializing(false);

        if (status === 'authenticated' && session) { 
            setUser(session.user)
            setError(null)
        } else if (status === "loading") { 
            setInitializing(true)
        }
        if (session === null) setError({message: "Failed to sign in"})
       
    }, [session, status, user]);

    const value = {
        user,
        error,
        // auth,
        initializing,
        setRedirect,
        getRedirect,
        clearRedirect,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
