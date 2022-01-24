import { useSession } from "next-auth/react";

export default function Profile() {
    const { data: session } = useSession();
    if (!session) return <p>Not authentiated!</p>
    return <p> You are authenticated! </p> 
}
