import Head from "next/head"
import dynamic from "next/dynamic"

import Header from "../components/header"

import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"

const GraphQLProvider = dynamic(() => import("../lib/graphql"), { ssr: false })

export default function Layout({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Bitcoin Beach official lightning network node"
        />

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
        <Header />
        <Component {...pageProps} />
      </GraphQLProvider>
    </>
  )
}
