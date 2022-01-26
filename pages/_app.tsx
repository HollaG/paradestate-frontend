// // import { ChakraProvider as MantineProvider } from "@chakra-ui/react";
// import { AppProps } from "next/dist/shared/lib/router/router";
// import { SessionProvider } from "next-auth/react";


// // import { MantineProvider } from "@mantine/core"

// function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
//     return (
//         // <MantineProvider>
//             <SessionProvider session={session}>
//                 <Component {...pageProps} />
//             </SessionProvider>
//         // </MantineProvider>
//     );
// }

// export default App;
import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>SAF Parade State Generator</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}