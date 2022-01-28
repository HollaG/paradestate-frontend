declare global {
    namespace NodeJS {
        interface ProcessEnv {
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            NODE_ENV: "development" | "production";
            MYSQL_HOST: string;
            MYSQL_PORT: number;
            MYSQL_DATABASE: string;
            MYSQL_USER: string;
            MYSQL_PASSWORD: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
