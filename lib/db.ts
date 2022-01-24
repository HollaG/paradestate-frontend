import { stringify } from "querystring";
import mysql from "serverless-mysql";
const db = mysql({
    config: {
        host: "localhost",
        port: 3306,
        database: "parade_state",
        user: "root",
        // password: process.env.MYSQL_PASSWORD
    },
});
export default async function executeQuery({
    query,
    values,
}: {
    query: string;
    values: any[];
}) {
    try {
        const results = await db.query<any>(query, values);
        await db.end();
        const stripped = results.map((rowDataPacket: any) =>
            Object.assign({}, rowDataPacket)
        );
        return stripped;
    } catch (error) {
        return { error };
    }
}
