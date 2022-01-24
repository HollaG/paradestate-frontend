import { FC } from "react"
import { signIn, signOut, useSession } from "next-auth/react";

const Navbar: FC = () => {
    const {data: session} = useSession();
    
    if (session && session.user) {
        return (
          <>
            Signed in as {session.user.email} <br />
            <p> Helo </p>
            <p> {session.user.unit} {session.user.company} </p>
            <button onClick={() => signOut()}>Sign out</button>
            
          </>
        )
      }
      return (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
         

        </>
      )

}
export default Navbar