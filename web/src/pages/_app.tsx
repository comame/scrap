import type { AppProps } from "next/app"
import { Suspense } from "react"

import "../styles/main.css"

function Loading() {
    return <div>Loding...</div>
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Suspense fallback={<Loading />}>
            <Component {...pageProps} />
        </Suspense>
    )
}
