import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"

import Head from "next/head"
import dynamic from "next/dynamic"
import { NextPage } from "next"
import { APP_DESCRIPTION } from "../config/config"

const GraphQLProvider = dynamic(() => import("../lib/graphql"), { ssr: false })

export default function Layout({
  Component,
  pageProps,
}: {
  Component: NextPage
  pageProps: Record<string, unknown>
}) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
          shrink-to-fit="no"
          viewport-fit="cover"
        />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="theme-color" content="#536FF2" />
        <meta name="apple-mobile-web-app-status-bar" content="#536FF2" />
        <link rel="apple-touch-icon" href="/BBW-QRLOGO.png" />
        <link rel="manifest" href="/manifest.json" id="manifest" />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-181044262-1"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-181044262-1');
    `,
          }}
        />
        <title>BitcoinBeach Lightning Node</title>
      </Head>
      <GraphQLProvider>
        <Component {...pageProps} />
      </GraphQLProvider>
    </>
  )
}
