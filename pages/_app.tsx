import {
    ChakraProvider,
    extendTheme,
    withDefaultColorScheme,
} from "@chakra-ui/react";
import { AppProps } from "next/dist/shared/lib/router/router";
import { SessionProvider } from "next-auth/react";
import DateFnsAdapter from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { createTheme, ThemeProvider } from "@mui/material";
import { deepmerge } from "@mui/utils";
import { Provider } from "react-redux";
import store from "../store";
import { AuthProvider } from "../components/Auth/AuthProvider";
import { AuthGuard } from "../components/Auth/AuthGuard";
import { NextPage } from "next/types";
import { NextProtectedPage } from "../lib/auth";
import "../styles/globals.css";

import Layout from "../components/Sidebar";
import Head from "next/head";
const muiTheme = createTheme({
    // typography: {
    //     fontFamily: "Inter", //Custom Font
    // },
    palette: {
        primary: {
            light: "#38B2AC", //Colors from Chakra-UI (Teal-400)
            main: "#319795", //Teal-500
            dark: "#2C7A7B", //Teal-600
        },
    },
    // stepper:  {
    //     iconColor: "red"
    // }
});

const chakraTheme = extendTheme(
    // withDefaultColorScheme({
    //     colorScheme: "teal",
    //     components: ["Button"],
    // })
    {
        components: {
            Divider: {
                sizes: {
                    lg: {
                        borderBottomWidth: "3px",
                    },
                },
            },
        },
    }
);

const theme = deepmerge(chakraTheme, muiTheme);

function App({
    Component,
    pageProps: { session, ...pageProps },
}: {
    Component: NextProtectedPage;
    pageProps: AppProps;
}) {
    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title> SAF Parade State Generator </title>
            </Head>
            <ChakraProvider resetCSS theme={theme}>
                <Provider store={store}>
                    <SessionProvider session={session}>
                        <Layout>
                            <LocalizationProvider dateAdapter={DateFnsAdapter}>
                                <AuthProvider>
                                    {Component.requireAuth ? (
                                        <AuthGuard>
                                            <Component {...pageProps} />
                                        </AuthGuard>
                                    ) : (
                                        <Component {...pageProps} />
                                    )}
                                </AuthProvider>
                            </LocalizationProvider>
                        </Layout>
                    </SessionProvider>
                </Provider>
            </ChakraProvider>
        </ThemeProvider>
    );
}

export default App;
