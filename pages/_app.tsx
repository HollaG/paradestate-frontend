import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AppProps } from "next/dist/shared/lib/router/router";
import { SessionProvider } from "next-auth/react";
import DateFnsAdapter from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { createTheme, ThemeProvider } from "@mui/material";
import { deepmerge } from "@mui/utils";
import { Provider } from "react-redux";
import store from "../store";

const muiTheme = createTheme({
    // typography: {
    //     fontFamily: "Inter", //Custom Font
    // },
    // palette: {
    //     primary: {
    //         light: "#38B2AC", //Colors from Chakra-UI (Teal-400)
    //         main: "#319795", //Teal-500
    //         dark: "#2C7A7B", //Teal-600
    //     },
    // },
});

const chakraTheme = extendTheme({
    components: {
        Link: {},
    },
});

const theme = deepmerge(chakraTheme, muiTheme);
function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <ChakraProvider resetCSS theme={theme}>
                <Provider store={store}>
                    <SessionProvider session={session}>
                        <LocalizationProvider dateAdapter={DateFnsAdapter}>
                            <Component {...pageProps} />
                        </LocalizationProvider>
                    </SessionProvider>
                </Provider>
            </ChakraProvider>
        </ThemeProvider>
    );
}

export default App;
