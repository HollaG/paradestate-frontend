import { stringify } from "querystring";
import mysql from "serverless-mysql";
const db = mysql({
    config: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD
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
