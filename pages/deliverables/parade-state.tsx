import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Layout from "../../components/Sidebar";

const ParadeState: NextPage = () => {
    const { data: session } = useSession();
    console.log("IN react app frontend", { session });
    return (
        <Layout
            content={
                <>
                    
                    <h3> This is the parade state generation page </h3>
                </>
            }
        ></Layout>
    );
}
export default ParadeState